import { StructureBuilderLoader } from '../components/StructureBuilderLoader';

/**
 * Server Component. The page shell is static; the interactive editor is a client
 * island (see StructureBuilderLoader) because its data lives in browser storage.
 */
export default function Page() {
  return (
    <>
      <h1 className="visually-hidden">Corporate structure builder</h1>
      <StructureBuilderLoader />
    </>
  );
}
