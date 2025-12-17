from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Order, User
from auth import get_user_by_username, get_user_by_email, SECRET_KEY, ALGORITHM
from typing import Dict, List, Optional
from jose import JWTError, jwt
import json

router = APIRouter(prefix="/api/ws", tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    async def broadcast_order_update(self, order_data: dict, customer_id: int, partner_id: int):
        # Send to customer
        await self.send_personal_message({
            "type": "order_update",
            "data": order_data
        }, customer_id)
        
        # Send to partner
        await self.send_personal_message({
            "type": "order_update",
            "data": order_data
        }, partner_id)

manager = ConnectionManager()

async def get_user_from_token(token: Optional[str], db: Session) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        identifier: str = payload.get("sub")
        if identifier is None:
            return None
        # Get user by email (email is now the primary identifier in tokens)
        # Only check username for backward compatibility with old tokens
        user = get_user_by_email(db, email=identifier)
        if not user:
            # Backward compatibility: try username only for old tokens
            user = get_user_by_username(db, username=identifier)
        return user
    except JWTError:
        return None

@router.websocket("/orders/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, token: Optional[str] = Query(None)):
    # Get database session manually
    db_gen = get_db()
    db = next(db_gen)
    try:
        # Verify authentication
        user = await get_user_from_token(token, db)
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Verify user_id matches authenticated user
        if user.id != user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        await manager.connect(websocket, user_id)
        try:
            while True:
                data = await websocket.receive_text()
                # Echo back or handle incoming messages
                await websocket.send_json({"type": "ping", "message": "connected"})
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)
    finally:
        db.close()

# Helper function to notify about order updates
async def notify_order_update(order: Order, db: Session):
    order_data = {
        "id": order.id,
        "status": order.status.value,
        "customer_id": order.customer_id,
        "partner_id": order.partner_id,
        "total_amount": order.total_amount,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None
    }
    await manager.broadcast_order_update(order_data, order.customer_id, order.partner_id)

