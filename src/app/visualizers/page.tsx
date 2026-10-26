import { VizGalleryHeading } from "./heading";
import { VisualizerGallery } from "@/components/visualizer/VisualizerGallery";
import { VIZ_META } from "@/visualizers/meta";

export const metadata = {
  title: "Algorithm visualizers",
  description: "Step through classic algorithms with highlighted pseudocode, a state panel and speed control.",
};

export default function VisualizersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <VizGalleryHeading count={VIZ_META.length} />
      <VisualizerGallery items={VIZ_META} />
    </main>
  );
}
