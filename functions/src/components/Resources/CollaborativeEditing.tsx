import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

const CollaborativeDocument = ({ documentId }) => {
  const [documentContent, setDocumentContent] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "documents", documentId), (doc) => {
      setDocumentContent(doc.data()?.content);
    });

    return () => unsubscribe();
  }, [documentId]);

  const handleContentChange = async (e) => {
    const content = e.target.value;
    setDocumentContent(content);
    await updateDoc(doc(db, "documents", documentId), { content });
  };

  return (
    <textarea value={documentContent} onChange={handleContentChange} />
  );
};

export default CollaborativeDocument;