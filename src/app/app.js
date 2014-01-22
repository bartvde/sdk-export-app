/**
 * Add all your dependencies here.
 *
 * @require widgets/Viewer.js
 * @require plugins/LayerTree.js
 * @require plugins/OLSource.js
 * @require plugins/OSMSource.js
 * @require plugins/WMSCSource.js
 * @require plugins/ZoomToExtent.js
 * @require plugins/NavigationHistory.js
 * @require plugins/Zoom.js
 * @require plugins/AddLayers.js
 * @require plugins/RemoveLayer.js
 * @require RowExpander.js
 * @require plugins/FeatureManager.js
 * @require plugins/FeatureEditor.js
 */

// create our own namespace 'myapp'
Ext.ns("myapp.plugins");

// we need to create a class that descends from the FeatureEditor so that we can
// have access to the featureManager. The FeatureEditPopup does not have this
// access. We will fire an event from our custom FeatureEditPopup called 'exportfeature'.
myapp.plugins.FeatureEditor = Ext.extend(gxp.plugins.FeatureEditor, {

    /** api: ptype = app_editor */
    ptype: "app_featureeditor",

    /** api: config[outputFormat]
     *  ``String`` The output format to use for the download. Defaults to a zipped up shape file.
     */   
    outputFormat: "SHAPE-ZIP",

    /** api: config[filenameAttribute]
     *  ``String`` The name of the attribute to use for the ZIP file's name
     */
    filenameAttribute: 'title',

    addOutput: function(config) {
        var output = myapp.plugins.FeatureEditor.superclass.addOutput.call(this, config);
        // we override addOutput so that we can listen for exportfeature on the popup
        output.on("exportfeature", this.exportFeature, this);
        return output;
    },
    exportFeature: function(popup, feature) {
        // get access to the feature manager
        var manager = this.target.tools[this.featureManager];
        // the manager has a schema with all the info we need to construct the url for GetFeature with our outputFormat
        var url = manager.schema.url;
        var typeName = manager.schema.reader.raw.featureTypes[0].typeName;
        url += 'service=WFS&request=GetFeature&version=1.0.0&typeName=' + typeName +
            '&format_options=filename:'+ feature.attributes[this.filenameAttribute] +'.zip' +
            '&featureID=' + feature.fid + '&outputFormat=' + this.outputFormat;
        window.open(url);
    }
});

Ext.preg(myapp.plugins.FeatureEditor.prototype.ptype, myapp.plugins.FeatureEditor);

// to add the extra Export button, we need to create a new class in our namespace
// that descends from FeatureEditPopup
myapp.FeatureEditPopup = Ext.extend(gxp.FeatureEditPopup, {
    // i18n
    exportText: "Export",
    initComponent: function() {
        myapp.FeatureEditPopup.superclass.initComponent.call(this);
        // add our new button to the bottom toolbar of the popup
        this.exportButton = this.bottomToolbar.add({
            text: this.exportText,
            iconCls: "export",
            handler: this.exportFeature,
            scope: this
        });
    },
    exportFeature: function() {
        // trigger an event so that our feature editor can do the rest
        this.fireEvent("exportfeature", this, this.feature);
    },
    // only show the export button after a feature has been saved
    startEditing: function() {
        myapp.FeatureEditPopup.superclass.startEditing.call(this);
        this.exportButton.hide();
    },
    stopEditing: function(save) {
        myapp.FeatureEditPopup.superclass.stopEditing.call(this, save);
        this.exportButton.show();
    }
});

/** api: xtype = app_featureeditpopup */
Ext.reg('app_featureeditpopup', myapp.FeatureEditPopup);

var app = new gxp.Viewer({
    portalConfig: {
        layout: "border",
        region: "center",
        
        // by configuring items here, we don't need to configure portalItems
        // and save a wrapping container
        items: [{
            id: "centerpanel",
            xtype: "panel",
            layout: "fit",
            region: "center",
            border: false,
            items: ["mymap"]
        }, {
            id: "westpanel",
            xtype: "container",
            layout: "fit",
            region: "west",
            width: 200
        }],
        bbar: {id: "mybbar"}
    },
    
    // configuration of all tool plugins for this application
    tools: [{
        ptype: "gxp_layertree",
        outputConfig: {
            id: "tree",
            border: true,
            tbar: [] // we will add buttons to "tree.bbar" later
        },
        outputTarget: "westpanel"
    }, {
        ptype: "gxp_addlayers",
        actionTarget: "tree.tbar"
    }, {
        ptype: "gxp_removelayer",
        actionTarget: ["tree.tbar", "tree.contextMenu"]
    }, {
        ptype: "gxp_zoomtoextent",
        actionTarget: "map.tbar"
    }, {
        ptype: "gxp_zoom",
        actionTarget: "map.tbar"
    }, {
        ptype: "gxp_navigationhistory",
        actionTarget: "map.tbar"
    }, {
        ptype: "gxp_featuremanager",
        id: "test_manager",
        paging: false,
        layer: {
            source: "local",
            name: "opengeo:mytestlayer"
        }
    }, {
        ptype: "app_featureeditor",
        featureManager: "test_manager",
        autoLoadFeature: true,
        outputConfig: {
            xtype: "app_featureeditpopup"
        }
    }],
    
    // layer sources
    sources: {
        local: {
            ptype: "gxp_wmscsource",
            url: "/geoserver/wms",
            version: "1.1.1"
        },
        osm: {
            ptype: "gxp_osmsource"
        }
    },
    
    // map and layers
    map: {
        id: "mymap", // id needed to reference map in portalConfig above
        title: "Map",
        projection: "EPSG:900913",
        center: [-10764594.758211, 4523072.3184791],
        zoom: 3,
        layers: [{
            source: "osm",
            name: "mapnik",
            group: "background"
        }, {
            source: "local",
            name: "opengeo:mytestlayer",
            selected: true
        }],
        items: [{
            xtype: "gx_zoomslider",
            vertical: true,
            height: 100
        }]
    }

});
