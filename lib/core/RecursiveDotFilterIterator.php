<?php
// https://stackoverflow.com/a/26889865/1238884
class RecursiveDotFilterIterator extends RecursiveFilterIterator
{
    public function accept()
    {
        return '.' !== substr($this->current()->getFilename(), 0, 1);
    }
}
