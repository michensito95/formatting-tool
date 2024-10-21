import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { DocumentService } from './services/document.service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    FeedbackComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule // Include DragDropModule if you plan to use drag-and-drop features
  ],
  providers: [DocumentService],
  bootstrap: [AppComponent]
})
export class AppModule { }
