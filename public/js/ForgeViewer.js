var viewer;
var viewables;
var floor; // viewable for a specific floor
var dbid;  // dbid for a list of cursor selected objects
var property;
var root;

// Zhiyuan Li's test function

// to cut down the rendering workloads we can selectively load only certain components/nodes of the model by passing in their dbids as an array to the load options
function launchViewer(urn) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };

  Autodesk.Viewing.Initializer(options, function(){
    viewer = new Autodesk.Viewing.GuiViewer3D(
      document.getElementById('forgeViewer'), 
      { 
        extensions: [ 'Autodesk.DocumentBrowser'] , 
        modelBrowserExcludeRoot: false 
      }); // create view instance
    viewer.start();
    var documentId = 'urn:' + urn;
    // console.log("within Autodesk.Viewing.Initializer, urn = " + urn);
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  viewables = doc.getRoot().getDefaultGeometry();
  root = doc.getRoot();

  // LZY TEST 1: go to a specific building floor, example, floor 4
  // LZY TEST 1: refer from https://stackoverflow.com/questions/62534876/load-only-specific-guids-as-priority-in-the-first-load-of-a-file-in-autodesk-for
  floor = this.viewables.parent.children[4];
  viewer.loadDocumentNode(doc, floor).then(i => {
  });
  // https://stackoverflow.com/questions/62015746/autodesk-forge-viewer-how-do-i-fire-an-event-after-model-loading-is-complete
  // this event is triggered when the viewer loads the initial model manifest (before loading its geometries
  this.viewer.addEventListener(Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (x) => { 
  // TODO: add configuration changes before loading model
  })

  // event is triggered after all the geometry is loaded
  this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (x) => {

    $('#testForgeAPI').click(function () { // button for test Forge AI
      console.log("All building information : \n",viewables.parent.children);

      // LZY TEST 2: get dbid of selected elements, then proceed focus, isolate, showall, prinr property commands
      dbid = viewer.getSelection();
      if (dbid.length == 0){
        alert("please use your cursor to select objects from your model, then click 'test Forge API' button again")
      } else {
        // https://stackoverflow.com/questions/66043440/get-properties-value-from-dbid-or-externalid-autodesk-forge
        viewer.getProperties(dbid[0], function(e){
              console.log("dbid of selected object: ",dbid);
              console.log('Entire object response: ',e);
              console.log('Properties: ',e.properties)
        });

        viewer.fitToView(dbid); // focus
        setTimeout(function(){viewer.isolate(dbid);},5000); // isolate, wait 5s
        setTimeout(function(){viewer.showAll();},5000);     // show all, wait 5s
      }
  })

  // LZY TEST 3: print instance tree and show/hide specific layers
  
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