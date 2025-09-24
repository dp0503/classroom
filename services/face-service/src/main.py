from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def health():
	return {"status": "ok"}

from fastapi import FastAPI\napp = FastAPI()\n@app.get( /health)\ndef health():\n    return {status: ok}
