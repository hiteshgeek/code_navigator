<?php
// parse_php_blocks.php
// Usage: php parse_php_blocks.php <file.php>
require 'vendor/autoload.php';

use PhpParser\Error;
use PhpParser\Node;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitorAbstract;
use PhpParser\ParserFactory;

if ($argc < 2) {
    fwrite(STDERR, "Usage: php parse_php_blocks.php <file.php>\n");
    exit(1);
}
$code = file_get_contents($argv[1]);
$parser = (new ParserFactory)->create(ParserFactory::PREFER_PHP7);

class BlockCollector extends NodeVisitorAbstract
{
    public $blocks = [];
    public function enterNode(Node $node)
    {
        if (
            $node instanceof Node\Stmt\Class_ ||
            $node instanceof Node\Stmt\Interface_ ||
            $node instanceof Node\Stmt\Trait_ ||
            $node instanceof Node\Stmt\Function_ ||
            $node instanceof Node\Stmt\ClassMethod
        ) {
            $this->blocks[] = [
                'name' => $node->name ? $node->name->toString() : '',
                'kind' => get_class($node),
                'startLine' => $node->getStartLine(),
                'endLine' => $node->getEndLine(),
            ];
        }
    }
}

try {
    $ast = $parser->parse($code);
    $traverser = new NodeTraverser();
    $collector = new BlockCollector();
    $traverser->addVisitor($collector);
    $traverser->traverse($ast);
    echo json_encode($collector->blocks);
} catch (Error $e) {
    fwrite(STDERR, "Parse error: {$e->getMessage()}\n");
    exit(1);
}
