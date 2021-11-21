var viewer;
var viewables;
var floor; // viewable for a specific floor

// Zhiyuan Li's test function

// to cut down the rendering workloads we can selectively load only certain components/nodes of the model by passing in their dbids as an array to the load options
function launchViewer(urn) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };

  Autodesk.Viewing.Initializer(options, function(){
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'), { extensions: [ 'Autodesk.DocumentBrowser'] }); // create view instance
    viewer.start();
    var documentId = 'urn:' + urn;
    // console.log("within Autodesk.Viewing.Initializer, urn = " + urn);
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  viewables = doc.getRoot().getDefaultGeometry();
  // LZY TEST 1: go to a specific building floor, example, floor 4
  // LZY TEST 1: refer from https://stackoverflow.com/questions/62534876/load-only-specific-guids-as-priority-in-the-first-load-of-a-file-in-autodesk-for
  var floor = this.viewables.parent.children[4];
  viewer.loadDocumentNode(doc, floor).then(i => {
    console.log("LZY TEST 1 , floor\n" + floor);
  });
  // https://stackoverflow.com/questions/62015746/autodesk-forge-viewer-how-do-i-fire-an-event-after-model-loading-is-complete
  // this event is triggered when the viewer loads the initial model manifest (before loading its geometries
  this.viewer.addEventListener(Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (x) => { 
    console.log("LZY TEST 1 , floor\n" + floor);
  })
}

function onDocumentLoadFailure(viewerErrorCode, viewerErrorMsg) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode + '\n- errorMessage:' + viewerErrorMsg);
}

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}