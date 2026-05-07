import httpx
import os

LINE_NOTIFY_TOKEN = os.environ.get("LINE_NOTIFY_TOKEN", "")
LINE_NOTIFY_URL = "https://notify-api.line.me/api/notify"

async def send_line_notify(message: str) -> bool:
    if not LINE_NOTIFY_TOKEN:
        return False
    headers = {"Authorization": f"Bearer {LINE_NOTIFY_TOKEN}"}
    data = {"message": message}
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(LINE_NOTIFY_URL, headers=headers, data=data)
            return res.status_code == 200
    except Exception:
        return False

def check_red_flag(wellness_score: float, acwr: float | None, open_injuries: int) -> bool:
    if wellness_score < 40:
        return True
    if acwr and (acwr > 1.5 or acwr < 0.8):
        return True
    if open_injuries > 0:
        return True
    return False

def build_alert_message(name: str, score: float, acwr: float | None, injuries: int) -> str:
    lines = [f"Red Flag Alert: {name}", f"Readiness Score: {score:.0f}%"]
    if acwr:
        if acwr > 1.5:
            lines.append(f"ACWR: {acwr} (Overload risk!)")
        elif acwr < 0.8:
            lines.append(f"ACWR: {acwr} (Undertraining)")
    if injuries > 0:
        lines.append(f"Open injuries: {injuries}")
    lines.append("Please review athlete status immediately.")
    return "\n".join(lines)
