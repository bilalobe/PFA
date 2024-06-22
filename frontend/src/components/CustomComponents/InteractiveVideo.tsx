import React, { useEffect, useState } from 'react';
// Import the Firebase modules needed
import { getDatabase, ref, onValue, off } from 'firebase/database';

export default function InteractiveVideo({ src, subtitleStreamUrl, dynamicContentId }) {
  const [subtitles, setSubtitles] = useState('');
  const [interactiveElements, setInteractiveElements] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const interactiveElementsRef = ref(db, `interactiveElements/${dynamicContentId}`);
    const unsubscribe = onValue(interactiveElementsRef, (snapshot) => {
      const elementsData = snapshot.val() || [];
      setInteractiveElements(elementsData);
    }, (error) => {
      console.error("Firebase read failed: ", error);
    });

    return () => off(interactiveElementsRef, 'value', unsubscribe);
  }, [dynamicContentId]);

  useEffect(() => {
    let blobUrl = '';
    if (subtitles) {
      blobUrl = createSubtitleBlobUrl(subtitles);
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [subtitles]);

  const createSubtitleBlobUrl = (subtitles) => {
    try {
      const blob = new Blob([subtitles], { type: 'text/vtt' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating subtitle blob URL: ", error);
      return '';
    }
  };

  return (
    <video controls>
      <source src={src} type="video/mp4" />
      {subtitles && (
        <track
          label="English"
          kind="subtitles"
          srcLang="en"
          src={createSubtitleBlobUrl(subtitles)}
          default
        />
      )}
      Your browser does not support the video tag.
    </video>
  );
}