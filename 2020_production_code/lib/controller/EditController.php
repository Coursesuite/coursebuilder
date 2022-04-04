<?php
	
class EditController extends Controller
{
    public function __construct(...$params)
    {
        parent::__construct($this, $params);
        parent::RequiresLogon();
    }
    
    public function index($id) {
	    $user_id = Session::get("user_id");
	    Response::cookie("aspname", DatabaseFactory::get_record("plebs", array("id" => $user_id), "name"));
	    Response::redirect(Config::get("ROOTURL") . "/engine/pages/edit/?id=$id", true);
    }

    public function quizkey($courseid, $quizName) {
	    $course = new CourseModel($courseid);
	    
	    if (!file_exists($course->RealPath . "\\SCO1\\en-us\\Content\\" . $quizName)) die("not yet saved");

		// $xml = file_get_contents($course->RealPath . "\\SCO1\\en-us\\Content\\" . $quizName);
		$json = file_get_contents($course->RealPath . "\\SCO1\\en-us\\Content\\" . str_replace(".xml",".json",$quizName));
		
		$obj = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $json));
		$node = new stdClass();
		if (property_exists($obj, "test")) {
			$node = $obj->test;
		} else if (property_exists($obj, "quiz")) {
			$node = $obj->quiz;
		}
		$data = [];
		forEach ($node->questionPool as $pool) {
			forEach	($pool->question as $question) {
				$prompt = $question->prompt;
				$interaction = str_replace(' ','',ucwords(preg_replace("/[^A-Za-z ]/", '', $prompt)));
				$correct = []; $incorrect = [];
				for ($c=0;$c<count($question->choices);$c++) {
					$choice = $question->choices[$c];
					$i = $c + 1;
					if ($choice->correct === true) {
						$correct[] = "<li value='{$i}'>{$choice->value}</li>";
					} else {
						$incorrect[] = "<li value='{$i}'>{$choice->value}</li>";
					}
				}
				$data[] = array(
					"id" => $question->id,
					"prompt" => $prompt,
					"interaction" => $interaction,
					"correct" => implode("\n", $correct),
					"incorrect" => implode("\n", $incorrect)
				);
			}
		}
		$model = [
			"title" => $course->name . ' ' . $quizName,
			"coursename" => $course->name,
			"name" => $quizName,
			"row" => $data
		];
        $this->View->render("edit/quiz/answerkey", $model);
    }

    
}