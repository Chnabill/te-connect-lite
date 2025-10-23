from database import engine, Base
from app.models import user  # import all models

Base.metadata.create_all(bind=engine)

  #Here we create the tables in the database
  
