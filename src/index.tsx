import { ActionPanel, List, CopyToClipboardAction, Detail, PushAction } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import fetch from "node-fetch";

export default function Command() {
  const state = useFetch();

  return (
    <List isLoading={state.isLoading}>
      {state.results.map((result) => (
        <List.Item
          key={result.url}
          icon={result.url}
          title={result.url}
          actions={
            <ActionPanel>
              <PushAction title="Show Details" target={imagePreview(result.url)} />
              {urlCopyAction(result.url)}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function imagePreview(url: string) {
  return <Detail markdown={`![LGTM](${url})`} actions={<ActionPanel>{urlCopyAction(url)}</ActionPanel>} />;
}

function urlCopyAction(url: string) {
  return <CopyToClipboardAction content={`![LGTM](${url})`} shortcut={{ modifiers: ["cmd"], key: "c" }} />;
}

function useFetch() {
  const [state, setState] = useState<ImageState>({ results: [], isLoading: true });
  const cancelRef = useRef<AbortController | null>(null);
  cancelRef.current?.abort();
  cancelRef.current = new AbortController();

  useEffect(() => {
    fetchImages(cancelRef.current.signal);
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  async function fetchImages(signal: AbortSignal) {
    const response = await fetch("https://lgtmoon.herokuapp.com/api/images/random", { method: "get", signal: signal });
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    type Json = Record<string, unknown>;
    const json = (await response.json()) as Json;
    const images = json.images as Image[];

    setState((oldState) => ({
      ...oldState,
      results: images,
      isLoading: false,
    }));
    return state;
  }
  return state;
}

interface ImageState {
  results: Image[];
  isLoading: boolean;
}
interface Image {
  url: string;
  isConverted: boolean;
}
