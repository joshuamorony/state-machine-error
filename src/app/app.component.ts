import { Component, inject } from "@angular/core";
import { PostsService } from "./shared/data-access/posts.service";

@Component({
  selector: "app-root",
  template: `
    <p>Let's load some data!</p>
    <ul>
      <ng-container *ngIf="data().value; else loading">
        <li *ngFor="let todo of data().value">
          {{ todo.title }}
        </li>
      </ng-container>
      <ng-template #loading>
        <li *ngIf="!data().error; else failed">
          They see me loadin'...
        </li>
      </ng-template>
      <ng-template #failed>
        <p>Uh oh... you're on your own buddy:</p>
        <small>
          {{ data().error }}
        </small>
      </ng-template>
    </ul>
  `,
  styles: [`small {color: red}`],
})
export class AppComponent {
  postService = inject(PostsService);
  data = this.postService.data;
}
