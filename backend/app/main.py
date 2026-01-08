from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from app.routes.assessment import assessment_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(
        assessment_bp,
        url_prefix="/api/assessment"
    )

    @app.route("/")
    def health():
        return {
            "status": "backend_running",
            "message": "Confidence Assessment Backend (Gemini-powered) is live"
        }

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
