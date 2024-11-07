import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { DocumentService } from './services/document.service';
<<<<<<< Updated upstream
=======
import { MainPageComponent } from './main-page/main-page.component';
import { UploadAssessmentComponent } from './upload-assessment/upload-assessment.component';


>>>>>>> Stashed changes


@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    FeedbackComponent,
<<<<<<< Updated upstream
=======
    MainPageComponent,
    UploadAssessmentComponent,
>>>>>>> Stashed changes
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  
  ],
  providers: [DocumentService],
  bootstrap: [AppComponent]
})
export class AppModule { }
