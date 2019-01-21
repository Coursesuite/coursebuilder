<?php
set_time_limit(0); // find a work around this bad idea

class CronController extends Controller {

    public function __construct(...$params) {
        $ts = gmdate("D, d M Y H:i:s") . " GMT";
        header("Expires: $ts");
        header("Last-Modified: $ts");
        header("Pragma: no-cache");
        header("Cache-Control: no-cache, must-revalidate");

        // parent::__construct($this, $params);
    }

    public function index() {
        $database = DatabaseFactory::getFactory()->getConnection();
        $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $database->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
        try {
            $database->query("
                SET @qs = (
                    select group_concat(
                        concat(
                            'select id,method from systasks where id = ', i.id, ' and running = 0 and lastrun <= unix_timestamp(', i.frequency, ')'
                        )
                        separator ' union '
                    )
                    from (
                        select id,frequency from systasks
                    ) i
                );
                PREPARE stmt FROM @qs;
            ");
            $results = $database->query("EXECUTE stmt;");
            while (list($id,$method) = $results->fetch(PDO::FETCH_NUM)) {
                if (is_callable($method)) {
                    $database->prepare("UPDATE systasks SET running=1 WHERE id=:id")->execute(array(":id"=>$id));
                    call_user_func($method); // rather than just $method(); this way it invokes the autoloader
                    $database->prepare("UPDATE systasks SET lastrun=unix_timestamp(CURRENT_TIMESTAMP), running=0 WHERE id=:id")->execute(array(":id"=>$id));
                }
            }
            $database->query("DEALLOCATE PREPARE stmt; SET @qs = null;");
        } catch (PDOException $e) {
            echo $e->getMessage();
            die();
        }
        unset ($database);

    }

    public function mediascan($contextid = 0) {
    	$t = microtime(true);
    	MediaModel::scan($contextid);
    	$e = microtime(true) - $t;
        $n = memory_get_peak_usage();
        $b = Utils::human_filesize($n,3);
        die("time = $e seconds, peak memory = $b");
    }

    public function compileHtml($page_id = 0) {
        if ($page_id < 1) return;
        $t = microtime(true);
        PageModel::compileHtml($page_id);
        $e = microtime(true) - $t;
        $n = memory_get_peak_usage();
        $b = Utils::human_filesize($n,3);
        die("time = $e seconds, peak memory = $b");
    }

    public function compileAllHtml($course_id = 0) {
        if ($course_id < 1) return;
        $t = microtime(true);
        CourseModel::compileAllHtml($course_id);
        $e = microtime(true) - $t;
        $n = memory_get_peak_usage();
        $b = Utils::human_filesize($n,3);
        die("time = $e seconds, peak memory = $b");
    }

    public function createThumbnail($page_id = 0) {
        if ($page_id < 1) return;
        $t = microtime(true);
        PageModel::createThumbnail($page_id);
        $e = microtime(true) - $t;
        $n = memory_get_peak_usage();
        $b = Utils::human_filesize($n,3);
        die("time = $e seconds, peak memory = $b");
    }

    public function createAllThumbnails($course_id = 0) {
        if ($course_id < 1) return;
        $t = microtime(true);
        CourseModel::createAllThumbnails($course_id);
        $e = microtime(true) - $t;
        $n = memory_get_peak_usage();
        $b = Utils::human_filesize($n,3);
        die("time = $e seconds, peak memory = $b");
    }


}