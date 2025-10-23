from dotenv import load_dotenv
from pathlib import Path

# Build the path to the .env file, which is in the parent directory of this file's directory (the project root)
env_path = Path(__file__).parent.parent / '.env'

# Load the environment variables from the .env file
load_dotenv(dotenv_path=env_path)
