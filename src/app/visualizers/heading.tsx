export function VizGalleryHeading({ count }: { count: number }) {
  return (
    <header>
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        Algorithm <span className="text-gradient">visualizers</span>
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-fg">
        {count} algorithms you can step through. Edit the input, press play or step one line at a time, and watch the
        pseudocode line, the state and the explanation change together.
      </p>
    </header>
  );
}
