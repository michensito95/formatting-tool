import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { DocumentService } from './services/document.service';
import { LessonUploadComponent } from './lesson-upload/lesson-upload.component';


@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    FeedbackComponent,
    LessonUploadComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  
  ],
  providers: [DocumentService],
  bootstrap: [AppComponent]
})
export class AppModule { }
