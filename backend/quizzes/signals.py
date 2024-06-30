from google.cloud import firestore
from backend.quizzes.utils import evaluate_test_attempt

db = firestore.Client()

def on_test_attempt_update(doc_snapshot, changes, read_time):
    for change in changes:
        if change.type.name == 'MODIFIED':
            attempt_data = change.document.to_dict()
            attempt_id = change.document.id
            if attempt_data.get('submitted', False):
                results = evaluate_test_attempt(attempt_data)
                db.collection('testAttempts').document(attempt_id).update(results)

def setup_firestore_listeners():
    doc_ref = db.collection('testAttempts')
    doc_watch = doc_ref.on_snapshot(on_test_attempt_update)