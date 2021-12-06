var viewer;
var viewables;
var floor; // viewable for a specific floor
var dbid;  // dbid for a list of cursor selected objects
var property;
var root;

// Zhiyuan Li's test function
const jsonDict = {
  "type":"new-program","uniqueId":"uuid-0949e25f-11f4-4e8b-984d-4029cf8a6d1c",
  "name":"Fm",
  "results":[
    {"bld_urn":{
      "value":"dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6amMyNGZuaXJ6aW1yNzE1Mzg0cGNkMWZ2ZGE1c3E3MjUtbW9kZWwvY29tYmluZWQuemlw",
      "display":"demo hospital"
    },
    "floor_guid":{
      "value":"b99a00f1-7234-7d70-1eb6-6b46cdc11a2a","display":"6th floor"},
      "building_name":"demo hospital"
    }
  ],
  "errors":[],
  "icon":"org.thingpedia.fm",
  "id":6
  }
let bld_urn = jsonDict.results[0].bld_urn.value
let floor_guid = jsonDict.results[0].floor_guid.value

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
    var documentId = urn == -1 ? 'urn:' + bld_urn : 'urn:' + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  viewables = doc.getRoot().getDefaultGeometry();
  root = doc.getRoot();

// LZY TEST 1: go to a specific building floor, example, floor 4
  // LZY TEST 1: refer from https://stackoverflow.com/questions/62534876/load-only-specific-guids-as-priority-in-the-first-load-of-a-file-in-autodesk-for
  // viewer.loadDocumentNode(stored_doc, root.findByGuid())
  // viewer.loadDocumentNode(stored_doc, root.findByGuid("0c3b3e3f-eaf5-55d6-6d0d-5cead9d17655"))
  // Dictionary for model GUID
  // "Full" : "0c3b3e3f-eaf5-55d6-6d0d-5cead9d17655"
  // "1F" :  "3f382dc1-04bd-4e0b-90d3-4cd44702899f"
  // "2F" :  "b3d41c56-03ef-139e-0966-c46e9e36f113"
  // "3F" :  "d1f1a349-8505-9b9b-3869-e824ff0a9901"
  // "4F" :  "2b673342-7f3b-b5eb-4ae5-a6b3e806562f"
  // "5F" :  "ead690f4-3f91-4159-3409-5a8f82a0ad4d"
  // "6F" :  "b99a00f1-7234-7d70-1eb6-6b46cdc11a2a"
  // viewer.loadDocumentNode(stored_doc, root.findByGuid())
  viewer.loadDocumentNode(doc, root.findByGuid(floor_guid)).then(i => {
  //viewer.loadDocumentNode(doc, floor).then(i => {

  });
  // https://stackoverflow.com/questions/62015746/autodesk-forge-viewer-how-do-i-fire-an-event-after-model-loading-is-complete
  // this event is triggered when the viewer loads the initial model manifest (before loading its geometries
  this.viewer.addEventListener(Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (x) => { 
  // TODO: add configuration changes before loading model
  })

  // event is triggered after all the geometry is loaded
  this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (x) => {

  //   $('#testForgeAPI').click(function () { // button for test Forge AI
  //     console.log("All building information : \n",viewables.parent.children);

  //     // LZY TEST 2: get dbid of selected elements, then proceed focus, isolate, showall, prinr property commands
  //     dbid = viewer.getSelection();
  //     if (dbid.length == 0){
  //       alert("please use your cursor to select objects from your model, then click 'test Forge API' button again")
  //       viewer.isolate([83422,83424]);
  //     } else {
  //       // https://stackoverflow.com/questions/66043440/get-properties-value-from-dbid-or-externalid-autodesk-forge
  //       viewer.getProperties(dbid[0], function(e){
  //             console.log("dbid of selected object: ",dbid);
  //             console.log('Entire object response: ',e);
  //             console.log('Properties: ',e.properties)
  //       });

  //       viewer.fitToView(dbid); // focus
  //       setTimeout(function(){viewer.isolate(dbid);},5000); // isolate, wait 5s
  //       setTimeout(function(){viewer.showAll();},5000);     // show all, wait 5s
  //     }
  // })

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