<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit966fcc2c4879a2f5a23480f61320f9d3
{
    public static $prefixLengthsPsr4 = array (
        'm' => 
        array (
            'mikehaertl\\wkhtmlto\\' => 20,
            'mikehaertl\\tmp\\' => 15,
            'mikehaertl\\shellcommand\\' => 24,
        ),
        'S' => 
        array (
            'Screen\\' => 7,
        ),
        'N' => 
        array (
            'Ninjitsu\\' => 9,
        ),
        'M' => 
        array (
            'MyCLabs\\Enum\\' => 13,
        ),
        'L' => 
        array (
            'LightnCandy\\' => 12,
        ),
        'C' => 
        array (
            'ColorThief\\' => 11,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'mikehaertl\\wkhtmlto\\' => 
        array (
            0 => __DIR__ . '/..' . '/mikehaertl/phpwkhtmltopdf/src',
        ),
        'mikehaertl\\tmp\\' => 
        array (
            0 => __DIR__ . '/..' . '/mikehaertl/php-tmpfile/src',
        ),
        'mikehaertl\\shellcommand\\' => 
        array (
            0 => __DIR__ . '/..' . '/mikehaertl/php-shellcommand/src',
        ),
        'Screen\\' => 
        array (
            0 => __DIR__ . '/..' . '/microweber/screen/src',
        ),
        'Ninjitsu\\' => 
        array (
            0 => __DIR__ . '/../..' . '/compilers/ninjitsu',
        ),
        'MyCLabs\\Enum\\' => 
        array (
            0 => __DIR__ . '/..' . '/myclabs/php-enum/src',
        ),
        'LightnCandy\\' => 
        array (
            0 => __DIR__ . '/..' . '/zordius/lightncandy/src',
        ),
        'ColorThief\\' => 
        array (
            0 => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief',
        ),
    );

    public static $fallbackDirsPsr4 = array (
        0 => __DIR__ . '/../..' . '/lib/core',
        1 => __DIR__ . '/../..' . '/lib/model',
        2 => __DIR__ . '/../..' . '/lib/collection',
    );

    public static $prefixesPsr0 = array (
        'P' => 
        array (
            'ParsedownExtra' => 
            array (
                0 => __DIR__ . '/..' . '/erusev/parsedown-extra',
            ),
            'Parsedown' => 
            array (
                0 => __DIR__ . '/..' . '/erusev/parsedown',
            ),
        ),
    );

    public static $classMap = array (
        'AccountModel' => __DIR__ . '/../..' . '/lib/model/AccountModel.php',
        'Application' => __DIR__ . '/../..' . '/lib/core/Application.php',
        'ColorThief\\CMap' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/CMap.php',
        'ColorThief\\ColorThief' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/ColorThief.php',
        'ColorThief\\Image\\Adapter\\GDImageAdapter' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/GDImageAdapter.php',
        'ColorThief\\Image\\Adapter\\GmagickImageAdapter' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/GmagickImageAdapter.php',
        'ColorThief\\Image\\Adapter\\IImageAdapter' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/IImageAdapter.php',
        'ColorThief\\Image\\Adapter\\ImageAdapter' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/ImageAdapter.php',
        'ColorThief\\Image\\Adapter\\ImagickImageAdapter' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/Image/Adapter/ImagickImageAdapter.php',
        'ColorThief\\Image\\ImageLoader' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/Image/ImageLoader.php',
        'ColorThief\\PQueue' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/PQueue.php',
        'ColorThief\\VBox' => __DIR__ . '/..' . '/ksubileau/color-thief-php/lib/ColorThief/VBox.php',
        'Config' => __DIR__ . '/../..' . '/lib/core/Config.php',
        'ContainerModel' => __DIR__ . '/../..' . '/lib/model/ContainerModel.php',
        'Controller' => __DIR__ . '/../..' . '/lib/core/Controller.php',
        'CourseModel' => __DIR__ . '/../..' . '/lib/model/CourseModel.php',
        'Csrf' => __DIR__ . '/../..' . '/lib/core/Csrf.php',
        'Curl' => __DIR__ . '/../..' . '/lib/core/Curl.php',
        'DatabaseFactory' => __DIR__ . '/../..' . '/lib/core/DatabaseFactory.php',
        'Environment' => __DIR__ . '/../..' . '/lib/core/Environment.php',
        'FieldSortHeap' => __DIR__ . '/../..' . '/lib/core/FieldSortHeap.php',
        'Filter' => __DIR__ . '/../..' . '/lib/core/Filter.php',
        'HashableModel' => __DIR__ . '/../..' . '/lib/core/HashableModel.php',
        'IO' => __DIR__ . '/../..' . '/lib/core/IO.php',
        'IPTC' => __DIR__ . '/../..' . '/lib/core/IPTC.php',
        'IPTC_TYPES' => __DIR__ . '/../..' . '/lib/core/IPTC.php',
        'Image' => __DIR__ . '/../..' . '/lib/core/Image.php',
        'ImportModel' => __DIR__ . '/../..' . '/lib/model/ImportModel.php',
        'IndexModel' => __DIR__ . '/../..' . '/lib/model/IndexModel.php',
        'KeyStore' => __DIR__ . '/../..' . '/lib/core/KeyStore.php',
        'KeyStoreInstance' => __DIR__ . '/../..' . '/lib/core/KeyStore.php',
        'Licence' => __DIR__ . '/../..' . '/lib/core/Licence.php',
        'LightnCandy\\Compiler' => __DIR__ . '/..' . '/zordius/lightncandy/src/Compiler.php',
        'LightnCandy\\Context' => __DIR__ . '/..' . '/zordius/lightncandy/src/Context.php',
        'LightnCandy\\Encoder' => __DIR__ . '/..' . '/zordius/lightncandy/src/Encoder.php',
        'LightnCandy\\Exporter' => __DIR__ . '/..' . '/zordius/lightncandy/src/Exporter.php',
        'LightnCandy\\Expression' => __DIR__ . '/..' . '/zordius/lightncandy/src/Expression.php',
        'LightnCandy\\Flags' => __DIR__ . '/..' . '/zordius/lightncandy/src/Flags.php',
        'LightnCandy\\LightnCandy' => __DIR__ . '/..' . '/zordius/lightncandy/src/LightnCandy.php',
        'LightnCandy\\Parser' => __DIR__ . '/..' . '/zordius/lightncandy/src/Parser.php',
        'LightnCandy\\Partial' => __DIR__ . '/..' . '/zordius/lightncandy/src/Partial.php',
        'LightnCandy\\Runtime' => __DIR__ . '/..' . '/zordius/lightncandy/src/Runtime.php',
        'LightnCandy\\SafeString' => __DIR__ . '/..' . '/zordius/lightncandy/src/SafeString.php',
        'LightnCandy\\StringObject' => __DIR__ . '/..' . '/zordius/lightncandy/src/Runtime.php',
        'LightnCandy\\Token' => __DIR__ . '/..' . '/zordius/lightncandy/src/Token.php',
        'LightnCandy\\Validator' => __DIR__ . '/..' . '/zordius/lightncandy/src/Validator.php',
        'MediaCollection' => __DIR__ . '/../..' . '/lib/collection/MediaCollection.php',
        'MediaModel' => __DIR__ . '/../..' . '/lib/model/MediaModel.php',
        'Model' => __DIR__ . '/../..' . '/lib/core/Model.php',
        'MyCLabs\\Enum\\Enum' => __DIR__ . '/..' . '/myclabs/php-enum/src/Enum.php',
        'PageFactory' => __DIR__ . '/../..' . '/lib/core/Page.php',
        'PageModel' => __DIR__ . '/../..' . '/lib/model/PageModel.php',
        'PagesCollection' => __DIR__ . '/../..' . '/lib/collection/PagesCollection.php',
        'Parsedown' => __DIR__ . '/..' . '/erusev/parsedown/Parsedown.php',
        'ParsedownExtra' => __DIR__ . '/..' . '/erusev/parsedown-extra/ParsedownExtra.php',
        'ParsedownExtraTest' => __DIR__ . '/..' . '/erusev/parsedown-extra/test/ParsedownExtraTest.php',
        'RecursiveDotFilterIterator' => __DIR__ . '/../..' . '/lib/core/RecursiveDotFilterIterator.php',
        'Request' => __DIR__ . '/../..' . '/lib/core/Request.php',
        'Response' => __DIR__ . '/../..' . '/lib/core/Response.php',
        'Screen\\Capture' => __DIR__ . '/..' . '/microweber/screen/src/Capture.php',
        'Screen\\Exceptions\\FileNotFoundException' => __DIR__ . '/..' . '/microweber/screen/src/Exceptions/FileNotFoundException.php',
        'Screen\\Exceptions\\InvalidArgumentException' => __DIR__ . '/..' . '/microweber/screen/src/Exceptions/InvalidArgumentException.php',
        'Screen\\Exceptions\\InvalidUrlException' => __DIR__ . '/..' . '/microweber/screen/src/Exceptions/InvalidUrlException.php',
        'Screen\\Exceptions\\PhantomJsException' => __DIR__ . '/..' . '/microweber/screen/src/Exceptions/PhantomJsException.php',
        'Screen\\Exceptions\\ScreenException' => __DIR__ . '/..' . '/microweber/screen/src/Exceptions/ScreenException.php',
        'Screen\\Exceptions\\TemplateNotFoundException' => __DIR__ . '/..' . '/microweber/screen/src/Exceptions/TemplateNotFoundException.php',
        'Screen\\Image\\Types' => __DIR__ . '/..' . '/microweber/screen/src/Image/Types.php',
        'Screen\\Image\\Types\\Jpg' => __DIR__ . '/..' . '/microweber/screen/src/Image/Types/Jpg.php',
        'Screen\\Image\\Types\\Png' => __DIR__ . '/..' . '/microweber/screen/src/Image/Types/Png.php',
        'Screen\\Image\\Types\\Type' => __DIR__ . '/..' . '/microweber/screen/src/Image/Types/Type.php',
        'Screen\\Injection\\LocalPath' => __DIR__ . '/..' . '/microweber/screen/src/Injection/LocalPath.php',
        'Screen\\Injection\\Scripts\\FacebookHideCookiesPolicy' => __DIR__ . '/..' . '/microweber/screen/src/Injection/Scripts/FacebookHideCookiesPolicy.php',
        'Screen\\Injection\\Scripts\\FacebookHideLogin' => __DIR__ . '/..' . '/microweber/screen/src/Injection/Scripts/FacebookHideLogin.php',
        'Screen\\Injection\\Scripts\\FacebookHideSignUp' => __DIR__ . '/..' . '/microweber/screen/src/Injection/Scripts/FacebookHideSignUp.php',
        'Screen\\Injection\\Scripts\\FacebookHideTopBar' => __DIR__ . '/..' . '/microweber/screen/src/Injection/Scripts/FacebookHideTopBar.php',
        'Screen\\Injection\\Url' => __DIR__ . '/..' . '/microweber/screen/src/Injection/Url.php',
        'Screen\\Location\\Jobs' => __DIR__ . '/..' . '/microweber/screen/src/Location/Jobs.php',
        'Screen\\Location\\Location' => __DIR__ . '/..' . '/microweber/screen/src/Location/Location.php',
        'Screen\\Location\\Output' => __DIR__ . '/..' . '/microweber/screen/src/Location/Output.php',
        'Session' => __DIR__ . '/../..' . '/lib/core/Session.php',
        'Text' => __DIR__ . '/../..' . '/lib/core/Text.php',
        'Utils' => __DIR__ . '/../..' . '/lib/core/Utils.php',
        'ValidationException' => __DIR__ . '/../..' . '/lib/core/Validator.php',
        'Validator' => __DIR__ . '/../..' . '/lib/core/Validator.php',
        'View' => __DIR__ . '/../..' . '/lib/core/View.php',
        'Zip' => __DIR__ . '/../..' . '/lib/core/Zip.php',
        'Zipper' => __DIR__ . '/../..' . '/lib/core/Zipper.php',
        'dbRow' => __DIR__ . '/../..' . '/lib/core/dbRow.php',
        'lessc' => __DIR__ . '/..' . '/leafo/lessphp/lessc.inc.php',
        'lessc_formatter_classic' => __DIR__ . '/..' . '/leafo/lessphp/lessc.inc.php',
        'lessc_formatter_compressed' => __DIR__ . '/..' . '/leafo/lessphp/lessc.inc.php',
        'lessc_formatter_lessjs' => __DIR__ . '/..' . '/leafo/lessphp/lessc.inc.php',
        'lessc_parser' => __DIR__ . '/..' . '/leafo/lessphp/lessc.inc.php',
        'mikehaertl\\shellcommand\\Command' => __DIR__ . '/..' . '/mikehaertl/php-shellcommand/src/Command.php',
        'mikehaertl\\tmp\\File' => __DIR__ . '/..' . '/mikehaertl/php-tmpfile/src/File.php',
        'mikehaertl\\wkhtmlto\\Command' => __DIR__ . '/..' . '/mikehaertl/phpwkhtmltopdf/src/Command.php',
        'mikehaertl\\wkhtmlto\\Image' => __DIR__ . '/..' . '/mikehaertl/phpwkhtmltopdf/src/Image.php',
        'mikehaertl\\wkhtmlto\\Pdf' => __DIR__ . '/..' . '/mikehaertl/phpwkhtmltopdf/src/Pdf.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit966fcc2c4879a2f5a23480f61320f9d3::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit966fcc2c4879a2f5a23480f61320f9d3::$prefixDirsPsr4;
            $loader->fallbackDirsPsr4 = ComposerStaticInit966fcc2c4879a2f5a23480f61320f9d3::$fallbackDirsPsr4;
            $loader->prefixesPsr0 = ComposerStaticInit966fcc2c4879a2f5a23480f61320f9d3::$prefixesPsr0;
            $loader->classMap = ComposerStaticInit966fcc2c4879a2f5a23480f61320f9d3::$classMap;

        }, null, ClassLoader::class);
    }
}
