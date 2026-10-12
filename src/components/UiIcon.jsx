const icons = {
  features: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /></>,
  dimensions: <><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M7 7v5m5-5v3m5-3v5" /></>,
  area: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 12h16M12 4v16" /><path d="m6.5 9.5 3-3m5 11 3-3" /></>,
  volume: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9m-8-9 8 4.5 8-4.5M8 5.25l8 4.5v9m0-13.5-8 4.5v9" /></>,
  exercises: <><path d="M13 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><path d="m14 6 4 4m-8 4 1-4 7-7a2.8 2.8 0 0 1 4 4l-7 7-5 1ZM8 18h6" /></>,
  left: <><path d="M4 9a8 8 0 1 1 1 9" /><path d="M4 3v6h6" /></>,
  right: <><path d="M20 9a8 8 0 1 0-1 9" /><path d="M20 3v6h-6" /></>,
  in: <><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6M7 10h6m-3-3v6" /></>,
  out: <><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6M7 10h6" /></>,
  reset: <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" /><path d="M12 8v5h4" /></>,
  plus: <path d="M5 12h14M12 5v14" />,
  minus: <path d="M5 12h14" />,
  hint: <><path d="M8 15a6 6 0 1 1 8 0c-1 .8-1 1.5-1 3H9c0-1.5 0-2.2-1-3ZM9 21h6M12 18v-6m-2-2 2 2 2-2" /></>,
};

export default function UiIcon({ name }) {
  return <svg className="ui-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {icons[name]}
  </svg>;
}
