"""
Script to migrate database schema
Run this script to update the database with new columns
"""
from database import engine, Base
from models import *
import sqlite3

def migrate_database():
    """Add new columns to existing products table"""
    conn = sqlite3.connect('business_mvp.db')
    cursor = conn.cursor()
    
    try:
        # Check if columns exist
        cursor.execute("PRAGMA table_info(products)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add original_price if it doesn't exist
        if 'original_price' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN original_price REAL")
            print("Added original_price column")
        
        # Add discount_percent if it doesn't exist
        if 'discount_percent' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN discount_percent REAL")
            print("Added discount_percent column")
        
        # Make price nullable
        # SQLite doesn't support ALTER COLUMN, so we need to recreate the table
        # For now, we'll just add the columns and update existing products
        # Existing products will have price set, which is fine
        
        conn.commit()
        print("Database migration completed successfully")
    except Exception as e:
        print(f"Migration error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()

