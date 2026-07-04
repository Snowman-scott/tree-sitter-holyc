package tree_sitter_holyc_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_holyc "github.com/snowman-scott/tree-sitter-holyc.git/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_holyc.Language())
	if language == nil {
		t.Errorf("Error loading HolyC grammar")
	}
}
