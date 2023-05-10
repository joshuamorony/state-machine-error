import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { from, of } from "rxjs";
import { delay, map, switchMap, tap } from "rxjs/operators";
import { assign, createMachine, interpret } from "xstate";

interface Data {
  title: string;
}

interface PostsMachineContext {
  value?: Data[];
  error?: string;
}

type PostsMachineEvent =
  | {
      type: "FETCH";
    }
  | { type: "RECEIVED_DATA"; result: Data[] };

const initialContext: PostsMachineContext = {
  value: undefined,
  error: undefined,
};

@Injectable({
  providedIn: "root",
})
export class PostsService {
  http = inject(HttpClient);

  postsMachine = createMachine<PostsMachineContext, PostsMachineEvent>({
    id: "posts-data",
    predictableActionArguments: true,
    initial: "fetching",
    context: initialContext,
    states: {
      idle: {
        initial: "noError",
        states: {
          noError: {},
          error: {},
        },
        on: {
          FETCH: {
            target: "fetching",
          },
        },
      },
      fetching: {
        invoke: {
          src: () =>
            this.getFromAPIError().pipe(
              map((data) => ({ type: "RECEIVED_DATA", result: data }))
            ),
          onError: {
            target: "idle.error",
            actions: assign({
              error: (_, event) => event.data.message,
            }),
          },
        },
        on: {
          RECEIVED_DATA: {
            target: "idle.noError",
            actions: assign({
              value: (_, event) => event.result,
            }),
          },
        },
      },
    },
  });

  postsMachineService = interpret(this.postsMachine).start();

  state$ = from(this.postsMachineService);
  data = toSignal(
    this.state$.pipe(map((state) => state.context)),
    { initialValue: initialContext }
  );

  getFromAPI() {
    return of(null).pipe(
      delay(2000),
      switchMap(() =>
        this.http.get<Data[]>("https://jsonplaceholder.typicode.com/todos")
      ),
      tap((val) => console.log(val))
    );
  }

  getFromAPIError() {
    return of(null).pipe(
      delay(2000),
      switchMap(() =>
        this.http.get<any>("https://jsonplaceholde.typicode.com/todos")
      )
    );
  }
}
