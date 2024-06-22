import { fetchInteractiveElements, incrementElementViews, recordElementInteraction } from '@/utils/api';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

interface InteractiveElement {
    id: number;
    timestamp: number;
    content: string;
}

const InteractiveVideoPlayer = ({ videoUrl, dynamicContentId }) => {
    const [interactiveElements, setInteractiveElements] = useState<InteractiveElement[]>([]);
    const [currentElement, setCurrentElement] = useState<InteractiveElement | null>(null);
    const playerRef = useRef<ReactPlayer>(null);
    const [play, setPlay] = useState(true);

    useEffect(() => {
        fetchInteractiveElements(dynamicContentId).then(setInteractiveElements);
    }, [dynamicContentId]);

    const onProgress = ({ playedSeconds }) => {
        const elementToShow = interactiveElements.find(element => {
            return Math.floor(playedSeconds) === element.timestamp;
        });

        if (elementToShow && currentElement !== elementToShow) {
            incrementElementViews(elementToShow.id);
            setCurrentElement(elementToShow);
            setPlay(false); // Pause the video when an interactive element is shown
        }
    };

    const onElementInteraction = () => {
        if (currentElement) {
            recordElementInteraction(currentElement.id);
            setCurrentElement(null);
            setPlay(true);
        }
    };

    return (
        <div>
            <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                playing={play}
                controls
                onProgress={onProgress}
            />
            {currentElement && (
                <div onClick={onElementInteraction}>
                    {/* Ensure rendering logic matches the structure of InteractiveElement */}
                    Interactive Element: {currentElement.content}
                </div>
            )}
        </div>
    );
};

export default InteractiveVideoPlayer;