def create_notification(db, patient_id, title, message, module, ntype="INFO", priority=2, recipient="doctor"):
    notification = {
        "patient_id": patient_id,
        "title": title,
        "message": message,
        "module": module,
        "type": ntype,
        "priority": priority,
        "recipient": recipient,
        "read": False
    }

    db.insert("notifications", notification)