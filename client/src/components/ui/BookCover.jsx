import { useEffect, useState } from 'react';

const LOCAL_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450">
    <rect width="300" height="450" fill="#0A2472"/>
    <rect x="24" y="24" width="252" height="402" rx="10" fill="#12358f" stroke="#FFC72C" stroke-width="6"/>
    <path d="M85 320h130M105 290h90M120 260h60" stroke="#FFC72C" stroke-width="12" stroke-linecap="round"/>
    <path d="M150 105c-35 0-58 24-58 56v84c0-16 13-28 29-28h29v-112zm0 0c35 0 58 24 58 56v84c0-16-13-28-29-28h-29v-112z" fill="#fff" opacity=".9"/>
    <text x="150" y="375" fill="#fff" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">BOOK COVER</text>
  </svg>
`)}`;

export default function BookCover({
  book,
  className,
  style,
  onClick,
  role,
  tabIndex,
  onKeyDown,
  ariaLabel,
}) {
  const [imageFailed, setImageFailed] = useState(!book?.coverUrl);

  useEffect(() => {
    setImageFailed(!book?.coverUrl);
  }, [book?._id, book?.coverUrl]);

  const imageUrl = imageFailed ? LOCAL_PLACEHOLDER : book.coverUrl;

  return (
    <div
      className={className}
      style={style}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
    >
      <img
        src={imageUrl}
        alt={imageFailed ? 'Book cover placeholder' : `Cover of ${book.title}`}
        onError={() => setImageFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit', display: 'block' }}
      />
    </div>
  );
}
