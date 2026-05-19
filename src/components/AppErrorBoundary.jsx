import React from 'react';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Build A Booking recovered from a render error.', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-2xl shadow-black/5">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-neutral-400 mb-4">Workspace Recovery</p>
          <h1 className="text-3xl font-black tracking-tight leading-none mb-4">Something paused for a second.</h1>
          <p className="text-sm leading-relaxed text-neutral-500 mb-6">
            Your workspace is safe. Refresh the app and Build A Booking will reload the latest saved data.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-12 w-full rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest"
          >
            Refresh Workspace
          </button>
        </section>
      </main>
    );
  }
}
