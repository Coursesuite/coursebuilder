<?php

// autoload_classmap.php @generated by Composer

$vendorDir = dirname(dirname(__FILE__));
$baseDir = dirname($vendorDir);

return array(
    'AccountModel' => $baseDir . '/lib/model/AccountModel.php',
    'Application' => $baseDir . '/lib/core/Application.php',
    'ColorThief\\CMap' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/CMap.php',
    'ColorThief\\ColorThief' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/ColorThief.php',
    'ColorThief\\Image\\Adapter\\GDImageAdapter' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/GDImageAdapter.php',
    'ColorThief\\Image\\Adapter\\GmagickImageAdapter' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/GmagickImageAdapter.php',
    'ColorThief\\Image\\Adapter\\IImageAdapter' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/IImageAdapter.php',
    'ColorThief\\Image\\Adapter\\ImageAdapter' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/ImageAdapter.php',
    'ColorThief\\Image\\Adapter\\ImagickImageAdapter' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/ImagickImageAdapter.php',
    'ColorThief\\Image\\ImageLoader' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/Image/ImageLoader.php',
    'ColorThief\\PQueue' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/PQueue.php',
    'ColorThief\\VBox' => $vendorDir . '/ksubileau/color-thief-php/lib/ColorThief/VBox.php',
    'Config' => $baseDir . '/lib/core/Config.php',
    'ContainerModel' => $baseDir . '/lib/model/ContainerModel.php',
    'Controller' => $baseDir . '/lib/core/Controller.php',
    'CourseModel' => $baseDir . '/lib/model/CourseModel.php',
    'Csrf' => $baseDir . '/lib/core/Csrf.php',
    'Curl' => $baseDir . '/lib/core/Curl.php',
    'DatabaseFactory' => $baseDir . '/lib/core/DatabaseFactory.php',
    'Environment' => $baseDir . '/lib/core/Environment.php',
    'Filter' => $baseDir . '/lib/core/Filter.php',
    'IO' => $baseDir . '/lib/core/IO.php',
    'IndexModel' => $baseDir . '/lib/model/IndexModel.php',
    'KeyStore' => $baseDir . '/lib/core/KeyStore.php',
    'KeyStoreInstance' => $baseDir . '/lib/core/KeyStore.php',
    'LightnCandy\\Compiler' => $vendorDir . '/zordius/lightncandy/src/Compiler.php',
    'LightnCandy\\Context' => $vendorDir . '/zordius/lightncandy/src/Context.php',
    'LightnCandy\\Encoder' => $vendorDir . '/zordius/lightncandy/src/Encoder.php',
    'LightnCandy\\Exporter' => $vendorDir . '/zordius/lightncandy/src/Exporter.php',
    'LightnCandy\\Expression' => $vendorDir . '/zordius/lightncandy/src/Expression.php',
    'LightnCandy\\Flags' => $vendorDir . '/zordius/lightncandy/src/Flags.php',
    'LightnCandy\\LightnCandy' => $vendorDir . '/zordius/lightncandy/src/LightnCandy.php',
    'LightnCandy\\Parser' => $vendorDir . '/zordius/lightncandy/src/Parser.php',
    'LightnCandy\\Partial' => $vendorDir . '/zordius/lightncandy/src/Partial.php',
    'LightnCandy\\Runtime' => $vendorDir . '/zordius/lightncandy/src/Runtime.php',
    'LightnCandy\\SafeString' => $vendorDir . '/zordius/lightncandy/src/SafeString.php',
    'LightnCandy\\Token' => $vendorDir . '/zordius/lightncandy/src/Token.php',
    'LightnCandy\\Validator' => $vendorDir . '/zordius/lightncandy/src/Validator.php',
    'MediaModel' => $baseDir . '/lib/model/MediaModel.php',
    'Model' => $baseDir . '/lib/core/Model.php',
    'MongoDB\\BulkWriteResult' => $vendorDir . '/mongodb/mongodb/src/BulkWriteResult.php',
    'MongoDB\\Client' => $vendorDir . '/mongodb/mongodb/src/Client.php',
    'MongoDB\\Collection' => $vendorDir . '/mongodb/mongodb/src/Collection.php',
    'MongoDB\\Database' => $vendorDir . '/mongodb/mongodb/src/Database.php',
    'MongoDB\\DeleteResult' => $vendorDir . '/mongodb/mongodb/src/DeleteResult.php',
    'MongoDB\\Exception\\BadMethodCallException' => $vendorDir . '/mongodb/mongodb/src/Exception/BadMethodCallException.php',
    'MongoDB\\Exception\\Exception' => $vendorDir . '/mongodb/mongodb/src/Exception/Exception.php',
    'MongoDB\\Exception\\InvalidArgumentException' => $vendorDir . '/mongodb/mongodb/src/Exception/InvalidArgumentException.php',
    'MongoDB\\Exception\\RuntimeException' => $vendorDir . '/mongodb/mongodb/src/Exception/RuntimeException.php',
    'MongoDB\\Exception\\UnexpectedValueException' => $vendorDir . '/mongodb/mongodb/src/Exception/UnexpectedValueException.php',
    'MongoDB\\Exception\\UnsupportedException' => $vendorDir . '/mongodb/mongodb/src/Exception/UnsupportedException.php',
    'MongoDB\\GridFS\\Bucket' => $vendorDir . '/mongodb/mongodb/src/GridFS/Bucket.php',
    'MongoDB\\GridFS\\CollectionWrapper' => $vendorDir . '/mongodb/mongodb/src/GridFS/CollectionWrapper.php',
    'MongoDB\\GridFS\\Exception\\CorruptFileException' => $vendorDir . '/mongodb/mongodb/src/GridFS/Exception/CorruptFileException.php',
    'MongoDB\\GridFS\\Exception\\FileNotFoundException' => $vendorDir . '/mongodb/mongodb/src/GridFS/Exception/FileNotFoundException.php',
    'MongoDB\\GridFS\\ReadableStream' => $vendorDir . '/mongodb/mongodb/src/GridFS/ReadableStream.php',
    'MongoDB\\GridFS\\StreamWrapper' => $vendorDir . '/mongodb/mongodb/src/GridFS/StreamWrapper.php',
    'MongoDB\\GridFS\\WritableStream' => $vendorDir . '/mongodb/mongodb/src/GridFS/WritableStream.php',
    'MongoDB\\InsertManyResult' => $vendorDir . '/mongodb/mongodb/src/InsertManyResult.php',
    'MongoDB\\InsertOneResult' => $vendorDir . '/mongodb/mongodb/src/InsertOneResult.php',
    'MongoDB\\Model\\BSONArray' => $vendorDir . '/mongodb/mongodb/src/Model/BSONArray.php',
    'MongoDB\\Model\\BSONDocument' => $vendorDir . '/mongodb/mongodb/src/Model/BSONDocument.php',
    'MongoDB\\Model\\CollectionInfo' => $vendorDir . '/mongodb/mongodb/src/Model/CollectionInfo.php',
    'MongoDB\\Model\\CollectionInfoCommandIterator' => $vendorDir . '/mongodb/mongodb/src/Model/CollectionInfoCommandIterator.php',
    'MongoDB\\Model\\CollectionInfoIterator' => $vendorDir . '/mongodb/mongodb/src/Model/CollectionInfoIterator.php',
    'MongoDB\\Model\\CollectionInfoLegacyIterator' => $vendorDir . '/mongodb/mongodb/src/Model/CollectionInfoLegacyIterator.php',
    'MongoDB\\Model\\DatabaseInfo' => $vendorDir . '/mongodb/mongodb/src/Model/DatabaseInfo.php',
    'MongoDB\\Model\\DatabaseInfoIterator' => $vendorDir . '/mongodb/mongodb/src/Model/DatabaseInfoIterator.php',
    'MongoDB\\Model\\DatabaseInfoLegacyIterator' => $vendorDir . '/mongodb/mongodb/src/Model/DatabaseInfoLegacyIterator.php',
    'MongoDB\\Model\\IndexInfo' => $vendorDir . '/mongodb/mongodb/src/Model/IndexInfo.php',
    'MongoDB\\Model\\IndexInfoIterator' => $vendorDir . '/mongodb/mongodb/src/Model/IndexInfoIterator.php',
    'MongoDB\\Model\\IndexInfoIteratorIterator' => $vendorDir . '/mongodb/mongodb/src/Model/IndexInfoIteratorIterator.php',
    'MongoDB\\Model\\IndexInput' => $vendorDir . '/mongodb/mongodb/src/Model/IndexInput.php',
    'MongoDB\\Model\\TypeMapArrayIterator' => $vendorDir . '/mongodb/mongodb/src/Model/TypeMapArrayIterator.php',
    'MongoDB\\Operation\\Aggregate' => $vendorDir . '/mongodb/mongodb/src/Operation/Aggregate.php',
    'MongoDB\\Operation\\BulkWrite' => $vendorDir . '/mongodb/mongodb/src/Operation/BulkWrite.php',
    'MongoDB\\Operation\\Count' => $vendorDir . '/mongodb/mongodb/src/Operation/Count.php',
    'MongoDB\\Operation\\CreateCollection' => $vendorDir . '/mongodb/mongodb/src/Operation/CreateCollection.php',
    'MongoDB\\Operation\\CreateIndexes' => $vendorDir . '/mongodb/mongodb/src/Operation/CreateIndexes.php',
    'MongoDB\\Operation\\DatabaseCommand' => $vendorDir . '/mongodb/mongodb/src/Operation/DatabaseCommand.php',
    'MongoDB\\Operation\\Delete' => $vendorDir . '/mongodb/mongodb/src/Operation/Delete.php',
    'MongoDB\\Operation\\DeleteMany' => $vendorDir . '/mongodb/mongodb/src/Operation/DeleteMany.php',
    'MongoDB\\Operation\\DeleteOne' => $vendorDir . '/mongodb/mongodb/src/Operation/DeleteOne.php',
    'MongoDB\\Operation\\Distinct' => $vendorDir . '/mongodb/mongodb/src/Operation/Distinct.php',
    'MongoDB\\Operation\\DropCollection' => $vendorDir . '/mongodb/mongodb/src/Operation/DropCollection.php',
    'MongoDB\\Operation\\DropDatabase' => $vendorDir . '/mongodb/mongodb/src/Operation/DropDatabase.php',
    'MongoDB\\Operation\\DropIndexes' => $vendorDir . '/mongodb/mongodb/src/Operation/DropIndexes.php',
    'MongoDB\\Operation\\Executable' => $vendorDir . '/mongodb/mongodb/src/Operation/Executable.php',
    'MongoDB\\Operation\\Find' => $vendorDir . '/mongodb/mongodb/src/Operation/Find.php',
    'MongoDB\\Operation\\FindAndModify' => $vendorDir . '/mongodb/mongodb/src/Operation/FindAndModify.php',
    'MongoDB\\Operation\\FindOne' => $vendorDir . '/mongodb/mongodb/src/Operation/FindOne.php',
    'MongoDB\\Operation\\FindOneAndDelete' => $vendorDir . '/mongodb/mongodb/src/Operation/FindOneAndDelete.php',
    'MongoDB\\Operation\\FindOneAndReplace' => $vendorDir . '/mongodb/mongodb/src/Operation/FindOneAndReplace.php',
    'MongoDB\\Operation\\FindOneAndUpdate' => $vendorDir . '/mongodb/mongodb/src/Operation/FindOneAndUpdate.php',
    'MongoDB\\Operation\\InsertMany' => $vendorDir . '/mongodb/mongodb/src/Operation/InsertMany.php',
    'MongoDB\\Operation\\InsertOne' => $vendorDir . '/mongodb/mongodb/src/Operation/InsertOne.php',
    'MongoDB\\Operation\\ListCollections' => $vendorDir . '/mongodb/mongodb/src/Operation/ListCollections.php',
    'MongoDB\\Operation\\ListDatabases' => $vendorDir . '/mongodb/mongodb/src/Operation/ListDatabases.php',
    'MongoDB\\Operation\\ListIndexes' => $vendorDir . '/mongodb/mongodb/src/Operation/ListIndexes.php',
    'MongoDB\\Operation\\ReplaceOne' => $vendorDir . '/mongodb/mongodb/src/Operation/ReplaceOne.php',
    'MongoDB\\Operation\\Update' => $vendorDir . '/mongodb/mongodb/src/Operation/Update.php',
    'MongoDB\\Operation\\UpdateMany' => $vendorDir . '/mongodb/mongodb/src/Operation/UpdateMany.php',
    'MongoDB\\Operation\\UpdateOne' => $vendorDir . '/mongodb/mongodb/src/Operation/UpdateOne.php',
    'MongoDB\\UpdateResult' => $vendorDir . '/mongodb/mongodb/src/UpdateResult.php',
    'Ninjitsu\\ValidationException' => $baseDir . '/lib/core/NinjaValidator.php',
    'Ninjitsu\\Validator' => $baseDir . '/lib/core/NinjaValidator.php',
    'Parsedown' => $vendorDir . '/erusev/parsedown/Parsedown.php',
    'ParsedownExtra' => $vendorDir . '/erusev/parsedown-extra/ParsedownExtra.php',
    'ParsedownExtraTest' => $vendorDir . '/erusev/parsedown-extra/test/ParsedownExtraTest.php',
    'ParsedownTest' => $vendorDir . '/erusev/parsedown/test/ParsedownTest.php',
    'Request' => $baseDir . '/lib/core/Request.php',
    'Response' => $baseDir . '/lib/core/Response.php',
    'Session' => $baseDir . '/lib/core/Session.php',
    'Text' => $baseDir . '/lib/core/Text.php',
    'Utils' => $baseDir . '/lib/core/Utils.php',
    'View' => $baseDir . '/lib/core/View.php',
    'Zip' => $baseDir . '/lib/core/Zip.php',
    'Zipper' => $baseDir . '/lib/core/Zipper.php',
);
