/* Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DefaultExternalServices, PDFViewerApplication } from "./app.js";
import { DownloadManager } from "./download_manager.js";
import { GenericL10n } from "./genericl10n.js";
import { BasePreferences } from "./preferences.js";

if (typeof PDFJSDev !== "undefined" && !PDFJSDev.test("GENERIC")) {
  throw new Error(
    'Module "pdfjs-web/genericcom" shall not be used outside ' +
      "GENERIC build."
  );
}

const GenericCom = {};

class GenericPreferences extends BasePreferences {
  async _writeToStorage(prefObj) {
    localStorage.setItem("pdfjs.preferences", JSON.stringify(prefObj));
  }

  async _readFromStorage(prefObj) {
    return JSON.parse(localStorage.getItem("pdfjs.preferences"));
  }
}

(function listenFindEvents() {
  const events = [
    "find",
    "findagain",
    "findhighlightallchange",
    "findcasesensitivitychange",
    "findentirewordchange",
    "findbarclose",
  ];
  const handleEvent = function ({ type, detail }) {
    if (!PDFViewerApplication.initialized) {
      return;
    }
    if (type === "findbarclose") {
      PDFViewerApplication.eventBus.dispatch(type, { source: window });
      return;
    }
    PDFViewerApplication.eventBus.dispatch("find", {
      source: window,
      type: type.substring("find".length),
      query: detail.query,
      phraseSearch: true,
      caseSensitive: !!detail.caseSensitive,
      entireWord: !!detail.entireWord,
      highlightAll: !!detail.highlightAll,
      findPrevious: !!detail.findPrevious,
    });
  };

  for (const event of events) {
    window.addEventListener(event, handleEvent);
  }
})();

class GenericExternalServices extends DefaultExternalServices {
  static updateFindControlState(data) {
    console.log("Updating find control state", data);
  }

  static updateFindMatchesCount(data) {
    console.log("Update find matches count", data);
  }

  static get supportsIntegratedFind() {
    return true;
  }

  static createDownloadManager(options) {
    return new DownloadManager(options);
  }

  static createPreferences() {
    return new GenericPreferences();
  }

  static createL10n({ locale = "en-US" }) {
    return new GenericL10n(locale);
  }
}
PDFViewerApplication.externalServices = GenericExternalServices;

export { GenericCom };
