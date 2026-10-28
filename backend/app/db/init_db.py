from app.db.session import engine, Base
import app.models  # Ensure models are imported so Base.metadata has them


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables initialized successfully.")
