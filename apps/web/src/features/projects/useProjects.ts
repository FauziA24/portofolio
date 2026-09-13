import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Project } from "../../types/api";
import { toViewProject } from "./mappers";
export type { ViewDemoStatus } from "../../types/view";
export function useProjects() {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    api
      .publicProjects()
      .then((p) => {
        if (active) {
          setData(p);
          setError(false);
        }
      })
      .catch(() => {
        if (active) {
          setData([]);
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return { projects: data.map(toViewProject), loading, error };
}

export function useFeaturedProjects() {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    api
      .featuredProjects()
      .then((p) => {
        if (active) {
          setData(p);
          setError(false);
        }
      })
      .catch(() => {
        if (active) {
          setData([]);
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return { projects: data.map(toViewProject), loading, error };
}
