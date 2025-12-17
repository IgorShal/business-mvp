from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Order, User
from auth import get_current_user
from typing import Dict, List
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

@router.websocket("/orders/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or handle incoming messages
            await websocket.send_json({"type": "ping", "message": "connected"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

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

