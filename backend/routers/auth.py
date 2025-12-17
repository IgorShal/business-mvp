from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models import User, Partner, UserType
from schemas import UserCreate, UserResponse, Token, PartnerCreate, PartnerResponse
from auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    import logging
    logging.info(f"Registering new user with email: {user_data.email}, username: {user_data.username}")
    
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logging.warning(f"Email already registered: {user_data.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        logging.warning(f"Username already taken: {user_data.username}")
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    # Debug: verify the hash works
    from auth import verify_password
    if not verify_password(user_data.password, hashed_password):
        raise HTTPException(status_code=500, detail="Password hashing failed")
    
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        user_type=user_data.user_type,
        full_name=user_data.full_name,
        phone=user_data.phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Verify user was created
    verify_user = db.query(User).filter(User.email == user_data.email).first()
    if verify_user:
        logging.info(f"User successfully created: ID={verify_user.id}, Email={verify_user.email}")
    else:
        logging.error(f"User creation failed - user not found after commit: {user_data.email}")
    
    return db_user

@router.post("/register-partner", response_model=PartnerResponse)
def register_partner(
    partner_data: PartnerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != UserType.PARTNER:
        raise HTTPException(status_code=403, detail="Only partners can create partner profiles")
    
    # Check if partner profile already exists
    if db.query(Partner).filter(Partner.user_id == current_user.id).first():
        raise HTTPException(status_code=400, detail="Partner profile already exists")
    
    # Create partner profile
    db_partner = Partner(
        user_id=current_user.id,
        name=partner_data.name,
        description=partner_data.description,
        latitude=partner_data.latitude,
        longitude=partner_data.longitude,
        address=partner_data.address,
        phone=partner_data.phone
    )
    db.add(db_partner)
    db.commit()
    db.refresh(db_partner)
    
    return db_partner

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses 'username' field, but we'll treat it as email
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/test-password")
def test_password_hash(password: str, db: Session = Depends(get_db)):
    """Test endpoint to verify password hashing works correctly"""
    from auth import get_password_hash, verify_password
    
    hashed = get_password_hash(password)
    verified = verify_password(password, hashed)
    
    return {
        "original": password,
        "hashed": hashed,
        "verified": verified,
        "hash_length": len(hashed),
        "hash_prefix": hashed[:30]
    }

@router.get("/debug/users")
def debug_users(db: Session = Depends(get_db)):
    """Debug endpoint to list all users in database"""
    users = db.query(User).all()
    return {
        "total_users": len(users),
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "user_type": u.user_type.value if u.user_type else None,
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in users
        ]
    }

