# models.py
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DATABASE_URL = "sqlite:///./mydb.sqlite"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    games = relationship("Game", back_populates="user")


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)

    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    character_name = Column(String, nullable=False)
    work = Column(Boolean, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="games")

    days = relationship(
        "Day",
        back_populates="game",
        cascade="all, delete-orphan",
    )

class Day(Base):
    __tablename__ = "days"

    id = Column(Integer, primary_key=True, index=True)

    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    number_of_day = Column(Integer, nullable=False)

    health = Column(Integer, nullable=False)
    happiness = Column(Integer, nullable=False)
    stress = Column(Integer, nullable=False)
    reputation = Column(Integer, nullable=False)
    education = Column(Integer, nullable=False)
    money = Column(Integer, nullable=False)
    weekly_income = Column(Integer, nullable=False)
    weekly_expense = Column(Integer, nullable=False)
    free_time = Column(Integer, nullable=False)

    game = relationship("Game", back_populates="days")


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Tables are created in mydb.sqlite")