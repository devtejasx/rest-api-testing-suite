import { useCallback, useEffect, useRef, useState } from "react";
import type { ExecutionState, RunStatus } from "@/types";
import {
  createInitialExecutionState,
  executionRequestsMock,
  makeLog,
} from "@/services/mock/execution.mock";

/** Requests that are scripted to fail, to make the demo run realistic. */
const FAILING_REQUEST_IDS = new Set(["e_refresh"]);
const STEP_INTERVAL_MS = 900;

/**
 * A self-contained, client-side simulation of a Newman collection run.
 *
 * When the backend exists this becomes a subscription (SSE / WebSocket) to a
 * real run stream; the component API — `state`, `start`, `reset`, `isRunning`
 * — stays the same.
 */
export function useExecution(collectionId?: string, collectionName?: string) {
  const [state, setState] = useState<ExecutionState>(() =>
    createInitialExecutionState(collectionId, collectionName),
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);
  const startRef = useRef(0);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    indexRef.current = 0;
    setState(createInitialExecutionState(collectionId, collectionName));
  }, [clear, collectionId, collectionName]);

  const start = useCallback(() => {
    clear();
    indexRef.current = 0;
    startRef.current = Date.now();

    setState((prev) => ({
      ...createInitialExecutionState(prev.collectionId, prev.collectionName),
      status: "running",
      logs: [makeLog("info", `Starting run for "${prev.collectionName}"…`)],
    }));

    timerRef.current = setInterval(() => {
      const i = indexRef.current;
      const total = executionRequestsMock.length;

      if (i >= total) {
        clear();
        setState((prev) => {
          const failed = prev.summary.failed;
          return {
            ...prev,
            status: failed > 0 ? "failed" : "passed",
            progress: 100,
            currentRequest: null,
            summary: {
              ...prev.summary,
              durationMs: Date.now() - startRef.current,
            },
            logs: [
              ...prev.logs,
              makeLog(
                failed > 0 ? "error" : "success",
                `Run finished — ${prev.summary.passed} passed, ${failed} failed.`,
              ),
            ],
          };
        });
        return;
      }

      const req = executionRequestsMock[i];
      const willFail = FAILING_REQUEST_IDS.has(req.id);
      const responseTime = Math.round(80 + Math.random() * 260);
      const status: RunStatus = willFail ? "failed" : "passed";
      const assertionsPassed = willFail ? 1 : 2 + Math.floor(Math.random() * 2);
      const assertionsFailed = willFail ? 1 : 0;

      setState((prev) => {
        const requests = prev.requests.map((r) =>
          r.id === req.id
            ? { ...r, status, responseTimeMs: responseTime, assertionsPassed, assertionsFailed }
            : r,
        );
        const nextIndex = i + 1;
        const logs = [
          ...prev.logs,
          makeLog("info", `→ ${req.method} ${req.endpoint}`),
          makeLog(
            willFail ? "error" : "success",
            willFail
              ? `✗ ${req.name} failed (${responseTime}ms) — assertion "Status code is 200"`
              : `✓ ${req.name} passed (${responseTime}ms)`,
          ),
        ];
        return {
          ...prev,
          progress: Math.round((nextIndex / total) * 100),
          currentRequest: nextIndex < total ? executionRequestsMock[nextIndex].name : null,
          requests,
          logs,
          summary: {
            ...prev.summary,
            passed: prev.summary.passed + (willFail ? 0 : 1),
            failed: prev.summary.failed + (willFail ? 1 : 0),
            durationMs: Date.now() - startRef.current,
          },
        };
      });

      indexRef.current = i + 1;
    }, STEP_INTERVAL_MS);
  }, [clear]);

  // Cleanup on unmount.
  useEffect(() => clear, [clear]);

  return {
    state,
    start,
    reset,
    isRunning: state.status === "running",
    isFinished: state.status === "passed" || state.status === "failed",
  };
}
