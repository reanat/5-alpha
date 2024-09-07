

// lib


// init


/**
 * @param {{ send: ((res: [string, string]) => void) }} sender
 * */
const init = (sender) =>
  /**
   * @param {[String,String]} [initialFileStateLocaltion, keyOfInitialLoadedFileLocation]
   * */
  ([initialFileStateLocaltion, keyOfInitialLoadedFileLocation]) => {
    const initialFileStateStr = localStorage.getItem(initialFileStateLocaltion);
    if (initialFileStateStr === null) {
      // return [JSON.stringify({ before: [], after: [], target: { name: "default.tsv", id: "0" }, nextId: 1 }), "word\tread\tNoun"]
      return sender.send([null, null])
    }
    const initialFileStateObj = JSON.parse(initialFileStateStr);
    const initialLoadedFileLocation = initialFileStateObj[keyOfInitialLoadedFileLocation];
    const initialLoadedFile = localStorage.getItem(initialLoadedFileLocation);

    /**@type {[string | null, string | null]}*/
    const res = [initialFileStateStr, initialLoadedFile];
    sender.send(res)
  }


// reader


/**
 * @param {{ send: ((res: string | null) => void) }} sender
 * */
const singleReader = (sender) =>
  /**
   * @param {string} req
   * @return {void}
   * */
  (req) => {
    const res = localStorage.getItem(req)

    sender.send(res)
  }

/**
 * @param {{ send: ((res: string[]) => void) }} sender
 * */
const multiReader = (sender) =>
  /**
   * @param {string []} req
   * @returns {void}
   * */
  (req) => {
    const res = req.map((key) => localStorage.getItem(key))
    sender.send(res);
  };


// writer


/**
 * @param {{ send: ((res: {}) => void) }} sender
 * */
const singleWriter = (sender) =>
  /**
   * @param {[string, string]}
   * @returns {void}
   * */
  ([key, val]) => {
    localStorage.setItem(key, val)
    sender.send({});
  };
/**
 * @param {{ send: ((res: {}) => void) }} sender
 * */
const multiWriter = (sender) =>
  /**
   * @param {[string, string][]} req
   * @returns {void}
   * */
  (req) => {
    req.map(([key, val]) => localStorage.setItem(key, val))
    sender.send({});
  };


// 組み合わせ

/**
 * @param {{ send: ((res: string) => void) }} sender
 * */
const readDoubleWriter = (sender) =>
  /**
   * @param {[string, [[string, string], [string, string]]]} [readReq, writeReq]
   * @returns {void}
   * */
  ([readReq, writeReqs]) => {
    console.log({ readReq })
    writeReqs.map(([key, val]) => localStorage.setItem(key, val))
    const res = localStorage.getItem(readReq)
    sender.send(res)
  }

/**
 * @param {{ send: ((res: string[]) => void) }} sender
 * */
const readWriterMulti = (sender) =>
  /**
   * @param {[[string], [string, string]]} [readReq, writeReq]
   * @returns {void}
   * */
  ([readReq, writeReq]) => {
    writeReq.map(([key, val]) => localStorage.setItem(key, val))
    const res = readReq.map((key) => localStorage.getItem(key) ?? "")
    sender.send(res)
  }


/**
 * @param {{ send: ((res: {}) => void) }} sender
 * */
const writeDeleter = (sender) =>
  /**
   * @param {[[string, string], string]} [[writeKey, writeVal], deleteKey] 
   * @returns {void}
   * */
  ([[writeKey, writeVal], deleteKey]) => {
    localStorage.setItem(writeKey, writeVal)
    localStorage.removeItem(deleteKey)
    sender.send({});
  };



// main


const app = Elm.Main.init();


// Pages.Edit


var ua = navigator.userAgent.toLowerCase();

onPageUnFocused = () => {
  app.ports.pageUnFocused.send({})
};

var isSafari = (ua.indexOf('safari') > -1) && (ua.indexOf('chrome') == -1);

window.addEventListener('visibilitychange', () => {
  const state = document.visibilityState;
  if (state === 'hidden') {
    onPageUnFocused();
  }
});

if (isSafari) {
  window.addEventListener('pagehide', () => {
    onPageUnFocused();
  });
}


app.ports.initEditCmdPort.subscribe(init(app.ports.initEditSubPort))


app.ports.readDoubleWriterOfChangeFileCmdPort.subscribe(readDoubleWriter(app.ports.readDoubleWriterOfChangeFileSubPort))


app.ports.selectTextInputTextOfEdit.subscribe((id) => {
  document.querySelectorAll(`#${id}`).forEach((ele) => {
    ele.select()
  })

})


app.ports.setClipboardOfEditCmdPort.subscribe(async (data) => {
  await window.navigator.clipboard.writeText(data)
})



app.ports.getClipboardOfEditCmdPort.subscribe(async () => {
  const res = await window.navigator.clipboard.readText()
  app.ports.getClipboardOfEditSubPort.send(res)
})


// Pages.Edit > Functional Button


app.ports.multiWriterOfEditForSaveStateNoReturnCmdPort.subscribe(multiWriter({ send: ({ }) => { } }))


app.ports.multiWriterOfEditBeforeTouchCmdPort.subscribe(multiWriter(app.ports.multiWriterOfEditBeforeTouchSubPort))


app.ports.multiWriterOfEditBeforeDeleteCmdPort.subscribe(multiWriter(app.ports.multiWriterOfEditBeforeDeleteSubPort))


app.ports.multiWriterOfEditBeforeRenameCmdPort.subscribe(multiWriter(app.ports.multiWriterOfEditBeforeRenameSubPort))


app.ports.toastOfEditCmdPort.subscribe((msg) => {
  alert(msg)
})


app.ports.multiWriterOfEditBeforeExportCmdPort.subscribe(multiWriter(app.ports.multiWriterOfEditBeforeExportSubPort))


app.ports.multiWriterOfEditBeforeImportCmdPort.subscribe(multiWriter(app.ports.multiWriterOfEditBeforeImportSubPort))


// Pages.Touch


app.ports.initTouchCmdPort.subscribe(init(app.ports.initTouchSubPort))


app.ports.multiWriterOfTouchCmdPort.subscribe(multiWriter(app.ports.multiWriterOfTouchSubPort))


// Pages.Delete


app.ports.initDeleteCmdPort.subscribe(init(app.ports.initDeleteSubPort))


app.ports.writeDeleterOfDeleteCmdPort.subscribe(writeDeleter(app.ports.writeDeleterOfDeleteSubPort))


// Pages.Rename


app.ports.initRenameCmdPort.subscribe(init(app.ports.initRenameSubPort))


app.ports.writerOfRenameCmdPort.subscribe(singleWriter(app.ports.writerOfRenameSubPort))


const logArg = (fn) => (...args) => {
  console.log({ logArg: args })
  return fn(...args)
}


// Pages.ExportData


app.ports.initExportCmdPort.subscribe(init(app.ports.initExportSubPort))


app.ports.multiReaderOfExportCmdPort.subscribe(multiReader(app.ports.multiReaderOfExportSubPort))


app.ports.exportOfExportCmdPort.subscribe(async (req) => {
  const JsZip = (await import("https://jspm.dev/jszip@3.10.1")).default


  const zip = new JsZip()


  req.map(([fname, fcontent]) => zip.file(fname, fcontent))


  const fromBlob = async (blob) => {
    var downLoadLink = document.createElement("a");
    downLoadLink.download = "bundle.zip";
    downLoadLink.href = URL.createObjectURL(blob);
    downLoadLink.dataset.downloadurl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
    downLoadLink.click();
  }


  zip.generateAsync({ type: "blob" }).then(async function(content) {
    await fromBlob(content)


    app.ports.exportOfExportSubPort.send({})
  });
})


// app.ports.shareOfExportCmdPort.subscribe(async (req) => {
//   const JsZip = (await import("https://jspm.dev/jszip@3.10.1")).default


//   const zip = new JsZip()


//   zip.file("bundle.txt", req);


//   const fromBlob = window.navigator.share !== undefined ?
//     async (blob) => {
//       await window.navigator.share(blob, "bundle.zip");
//     } :

//     async (blob) => {
//       var downLoadLink = document.createElement("a");
//       downLoadLink.download = "bundle.zip";
//       downLoadLink.href = URL.createObjectURL(blob);
//       downLoadLink.dataset.downloadurl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
//       downLoadLink.click();

//     }


//   zip.generateAsync({ type: "blob" }).then(async function(content) {
//     await fromBlob(content)
//   });




// })


// Pages.ImportData


/**
 * @param {{ send: ((res: string) => void) }} sender
 * */
const parseZip = (sender) =>
  /**
   * @param {string} dataUrl 
   * */
  async (dataUrl) => {
    const JsZip = (await import("https://jspm.dev/jszip@3.10.1")).default


    const zip = new JsZip()


    const blob = await fetch(dataUrl)
      .then(response => response.blob())


    await zip.loadAsync(blob)


    const res = []


    await Promise.all(
      Object.entries(zip.files).map(async ([relativePath, zipEntry]) => {
        if (!zipEntry.dir) {
          const fileName = relativePath.replace('exam/', '');
          const content = await zipEntry.async('text');
          res.push([fileName, content])
        }
      })
    );

    sender.send(res)


  }


app.ports.initImportCmdPort.subscribe(init(app.ports.initImportSubPort))


app.ports.parseZipForImportFromBackupCmdPort.subscribe(parseZip(app.ports.parseZipForImportFromBackupSubPort))


app.ports.parseZipForImportFromGoogleCmdPort.subscribe(parseZip(app.ports.parseZipForImportFromGoogleSubPort))


app.ports.multiWriterOfImportDataCmdPort.subscribe(multiWriter(app.ports.multiWriterOfImportDataSubPort))



