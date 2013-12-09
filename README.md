sdk-export-app
==============

This application shows how to create a custom plugin and widget with OpenGeo Suite SDK. The purpose of this custom plugin and widget is to add an extra button to the FeatureEditor that can export a digitized (or existing feature) as SHAPE-ZIP or KML (or any other output format that GeoServer supports).

This application can be run with OpenGeo Suite SDK:

```
suite-sdk debug --geoserver http://localhost:8080/geoserver /mycheckoutpath/sdk-export-app
```

It depends on a layer idenfified by ```opengeo:mytestlayer``` on the local GeoServer instance, but it can be configured with any other layer.
