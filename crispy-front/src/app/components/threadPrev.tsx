'use client';

import { useState } from 'react';
import '../../css/threadPrev.css';
import Image from 'next/image';

interface ThreadPreviewProps {
  threadId: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  replies: number;
  createdAt: string;
  boardName: string;
}

export function ThreadPreview({
  threadId,
  content,
  imageUrl,
  imageAlt,
  replies,
  createdAt,
  boardName
}: ThreadPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxContentLength = 200;

  const shouldTruncate = content.length > maxContentLength;
  const displayContent = isExpanded ? content : content.slice(0, maxContentLength) + (shouldTruncate ? '...' : '');

  return (
    <div className="thread-preview">
      <div className="thread-preview-content">
        {imageUrl && (
          <div className="thread-preview-image-container">
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src={`/api/proxy-image?imageName=${imageUrl.split('/').pop()}`}
                alt="404"
                className="thread-preview-image"
                width={128}
                height={128}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </a>
          </div>
        )}

        <div className="thread-preview-main">
          <h3 className="thread-preview-title">
            <a href={`/${boardName}/${threadId}`}>#{threadId}</a>
          </h3>
          <div className="thread-preview-text">
            <p>{displayContent}</p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="thread-preview-showmore"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          <div className="thread-preview-info">
            <div className="info-group">
              <span>Replies: {replies}</span>
              <span>{createdAt}</span>
            </div>

            <div className="thread-preview-actions">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}