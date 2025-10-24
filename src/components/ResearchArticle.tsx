import React, { useState, useEffect } from 'react';
import { type ResearchArticle } from '@/types/schemas'

interface Props {
  article: ResearchArticle;
}

const displayAuthorsCount = 3;

function formatDate(date: Date): string {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const month = newDate.toLocaleString('en', { month: 'long' });
  return `${month} ${year}`;
}

function getTypewriterAuthorString(typed: string[]) {
  return typed.join(', ');
}

const ArticleEntry: React.FC<Props> = ({ article }) => {
  const [showAuthors, setShowAuthors] = useState(false);
  const [showAbstract, setShowAbstract] = useState(false);
  const [typedAuthors, setTypedAuthors] = useState<string[]>([]);
  const [typedOut, setTypedOut] = useState("");
  const [animatingExpand, setAnimatingExpand] = useState(false);
  const [animatingCollapse, setAnimatingCollapse] = useState(false);
  const [typedAuthorString, setTypedAuthorString] = useState('');

  const authorsArr = Array.isArray(article.authors) ? article.authors : [];
  const mainAuthors = authorsArr.slice(0, displayAuthorsCount);
  const moreAuthors = authorsArr.slice(displayAuthorsCount);
  const moreAuthorsCount = moreAuthors.length;
  const moreAuthorsText = `and ${moreAuthorsCount} more author${moreAuthorsCount > 1 ? 's' : ''}`;
  const typingSpeedFast = 5; // ms
  const typingSpeedSlow = 25;

  // Animate expanding: type in extra authors
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (animatingExpand && showAuthors) {
      setTypedAuthorString(''); // start fresh

      // Compose the full string for extra authors (commas included)
      const authorStrings = moreAuthors.map((name, idx) =>
        idx === 0 ? name : `, ${name}`
      );
      const fullString = authorStrings.join('');

      let i = 0;

      function typeNextChar() {
        if (i <= fullString.length) {
          setTypedAuthorString(fullString.slice(0, i));
          i++;
          timer = setTimeout(typeNextChar, typingSpeedFast);
        } else {
          setAnimatingExpand(false);
        }
      }

      typeNextChar();

      return () => clearTimeout(timer);
    }
  }, [animatingExpand, showAuthors, moreAuthors.join(',')]);

  // Animate collapsing: type out "and X more authors" one character at a time after extra authors disappear
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (animatingCollapse && !showAuthors) {
      setTypedAuthors([]); // Extra authors removed instantly!
      setTypedOut("");
      let i = 0;
      function typeText() {
        if (i <= moreAuthorsText.length) {
          setTypedOut(moreAuthorsText.slice(0, i));
          i++;
          timer = setTimeout(typeText, typingSpeedSlow);
        } else {
          setAnimatingCollapse(false);
        }
      }
      typeText();
      return () => clearTimeout(timer);
    }
  }, [animatingCollapse, showAuthors, moreAuthorsText]);

  function handleAuthorsClick() {
    if (showAuthors) {
      setAnimatingCollapse(true);   // Start collapse sequence
      setAnimatingExpand(false);
      setShowAuthors(false);
    } else {
      setAnimatingExpand(true);     // Start expand sequence
      setAnimatingCollapse(false);
      setTypedOut("");
      setShowAuthors(true);
    }
  }

  // Reset animation when authors change (optional, safe cleanup)
  useEffect(() => {
    setTypedAuthors([]);
    setTypedOut("");
    setAnimatingCollapse(false);
    setAnimatingExpand(false);
  }, [moreAuthors.join(','), article.title]);

  return (
    <section className="flex flex-col text-left items-left">
      <span className="font-header text-base font-semibold text-content-1">
        {article.title}
      </span>
      <span className="font-base text-base font-light text-content-2" >
        {mainAuthors.join(', ')}
        {moreAuthorsCount > 0 && (
          <>
            {mainAuthors.length > 0 ? ', ' : ''}
            <span
              onClick={handleAuthorsClick}
              style={{ cursor: "pointer", display: "inline" }}
              className="inline whitespace-normal text-wrap text-left underline decoration-dotted underline-offset-2 text-content-3 hover:text-content-2 soft-transition focus-outline-rounded"
              tabIndex={0}
              role="button"
              aria-pressed={showAuthors}
            >
              {animatingExpand && showAuthors
              ? typedAuthorString
              : animatingCollapse && !showAuthors
                ? typedOut
                : showAuthors
                  ? moreAuthors.join(', ')
                  : moreAuthorsText
            }
            </span>
          </>
        )}
      </span>
      <span className="font-base text-base font-light text-content-4">
        <span className="italic mr-1"> {article.journal} </span>
        {formatDate(article.date_published)}
      </span>

      <div className="mt-2 flex gap-2">
        {article.abstract &&
          <button
            onClick={() => setShowAbstract(!showAbstract)}
            className="rounded-full bg-surface-2 hover:bg-surface-3 px-2 py-1 font-base text-sm text-content-3 hover:text-content-2 soft-transition uppercase"
          >
            abstract
          </button>
        }
        {article.doi &&
          <a
            href={`https://doi.org/${article.doi}`}
            target="_blank"
            rel="noopener"
            className="rounded-full bg-surface-2 hover:bg-surface-3 px-2 py-1 font-base text-sm text-content-3 hover:text-content-2 soft-transition uppercase"
          >
            doi
          </a>
        }
      </div>
      <div
        className={`
          bg-surface-1 rounded-xl mt-3 font-base font-light text-sm text-content-1
          transition-all duration-600 ease-in-out
          overflow-y-auto overscroll-auto
          ${showAbstract ? 'max-h-64 opacity-100 p-4 translate-y-0' : 'max-h-0 opacity-0 translate-y-4'}
        `}
        style={{ pointerEvents: showAbstract ? 'auto' : 'none' }}
        aria-hidden={!showAbstract}
      >
        {article.abstract}
      </div>
    
    </section>
  );
};

export default ArticleEntry;