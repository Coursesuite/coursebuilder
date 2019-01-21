<?php
class FieldSortHeap extends SplHeap
  {
    private $sortField;

    public function __construct($sortField)
    {
      $this->sortField = $sortField;
    }

    public function compare($a, $b)
    {
      return strnatcmp($b[$this->sortField], $a[$this->sortField]);
    }
  }