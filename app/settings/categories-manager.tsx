"use client";

import { useState, useOptimistic, useTransition } from "react";
import { ChevronDown, Plus, X, Edit2, Trash2, Check } from "feather-icons-react";
import classNames from "classnames";
import type { CategoryDTO } from "@/app/lib/category";
import type { CategoryRuleDTO } from "@/app/lib/category-rule";
import {
  createCategoryRule,
  updateCategoryRule,
  deleteCategoryRule,
} from "@/app/actions/category-rule";

type CategoryWithRules = CategoryDTO & {
  rules: CategoryRuleDTO[];
};

interface CategoriesManagerProps {
  categoriesWithRules: CategoryWithRules[];
}

export function CategoriesManager({ categoriesWithRules }: CategoriesManagerProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-2">
      {categoriesWithRules.map((category, index) => (
        <CategoryCard
          key={category.id}
          category={category}
          isExpanded={expandedId === category.id}
          onToggle={() => toggleExpand(category.id)}
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
}

interface CategoryCardProps {
  category: CategoryWithRules;
  isExpanded: boolean;
  onToggle: () => void;
  style?: React.CSSProperties;
}

function CategoryCard({ category, isExpanded, onToggle, style }: CategoryCardProps) {
  const [optimisticRules, updateOptimisticRules] = useOptimistic(
    category.rules,
    (state, action: { type: "add" | "update" | "delete"; rule?: CategoryRuleDTO; id?: number }) => {
      switch (action.type) {
        case "add":
          return action.rule ? [...state, action.rule] : state;
        case "update":
          return state.map((r) => (r.id === action.rule?.id ? action.rule : r));
        case "delete":
          return state.filter((r) => r.id !== action.id);
        default:
          return state;
      }
    }
  );

  const totalKeywords = optimisticRules.reduce(
    (sum, rule) => sum + rule.keywords.length,
    0
  );

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden backdrop-blur-sm"
      style={style}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center gap-3 hover:bg-neutral-800/50 transition-colors"
      >
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{
            backgroundColor: category.color ?? "var(--muted)",
          }}
        />
        <span className="font-medium text-sm flex-1 text-left">{category.name}</span>
        <span className="text-xs text-muted-foreground tabular-nums mr-2">
          {totalKeywords} keyword{totalKeywords !== 1 ? "s" : ""}
        </span>
        <ChevronDown
          size={16}
          className={classNames(
            "text-muted-foreground transition-transform duration-200",
            { "rotate-180": isExpanded }
          )}
        />
      </button>

      <div
        className={classNames(
          "grid transition-all duration-200 ease-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-2 border-t border-neutral-800/50">
            <RulesList
              categoryId={category.id}
              rules={optimisticRules}
              onOptimisticUpdate={updateOptimisticRules}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface RulesListProps {
  categoryId: number;
  rules: CategoryRuleDTO[];
  onOptimisticUpdate: (action: { type: "add" | "update" | "delete"; rule?: CategoryRuleDTO; id?: number }) => void;
}

function RulesList({ categoryId, rules, onOptimisticUpdate }: RulesListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddRule = async (keywords: string[]) => {
    const tempRule: CategoryRuleDTO = {
      id: Date.now(),
      categoryId,
      userId: "",
      keywords,
      createdAt: new Date(),
    };

    startTransition(async () => {
      onOptimisticUpdate({ type: "add", rule: tempRule });
      await createCategoryRule(categoryId, keywords);
    });

    setIsAdding(false);
  };

  const handleUpdateRule = async (ruleId: number, keywords: string[]) => {
    const existingRule = rules.find((r) => r.id === ruleId);
    if (!existingRule) return;

    const updatedRule: CategoryRuleDTO = { ...existingRule, keywords };

    startTransition(async () => {
      onOptimisticUpdate({ type: "update", rule: updatedRule });
      await updateCategoryRule(ruleId, keywords);
    });
  };

  const handleDeleteRule = async (ruleId: number) => {
    startTransition(async () => {
      onOptimisticUpdate({ type: "delete", id: ruleId });
      await deleteCategoryRule(ruleId);
    });
  };

  return (
    <div className="space-y-3">
      {rules.length === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground py-2">
          No rules yet. Add keywords to auto-categorize transactions.
        </p>
      )}

      {rules.map((rule) => (
        <RuleEditor
          key={rule.id}
          rule={rule}
          onSave={(keywords) => handleUpdateRule(rule.id, keywords)}
          onDelete={() => handleDeleteRule(rule.id)}
          disabled={isPending}
        />
      ))}

      {isAdding ? (
        <RuleEditor
          onSave={handleAddRule}
          onCancel={() => setIsAdding(false)}
          disabled={isPending}
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          <Plus size={14} />
          <span>Add rule</span>
        </button>
      )}
    </div>
  );
}

interface RuleEditorProps {
  rule?: CategoryRuleDTO;
  onSave: (keywords: string[]) => void;
  onDelete?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

function RuleEditor({
  rule,
  onSave,
  onDelete,
  onCancel,
  disabled,
  autoFocus,
}: RuleEditorProps) {
  const [keywords, setKeywords] = useState<string[]>([...(rule?.keywords ?? [])]);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(!rule);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      if (!keywords.includes(inputValue.trim())) {
        setKeywords([...keywords, inputValue.trim()]);
      }
      setInputValue("");
    } else if (event.key === "Backspace" && !inputValue && keywords.length > 0) {
      setKeywords(keywords.slice(0, -1));
    } else if (event.key === "Escape") {
      if (onCancel) {
        onCancel();
      } else {
        setIsEditing(false);
        setKeywords([...(rule?.keywords ?? [])]);
      }
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove));
  };

  const handleSave = () => {
    if (keywords.length > 0) {
      onSave(keywords);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsEditing(false);
      setKeywords([...(rule?.keywords ?? [])]);
    }
  };

  if (!isEditing && rule) {
    return (
      <div className="group flex items-start gap-2">
        <div className="flex-1 flex flex-wrap gap-1.5">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-800 text-xs font-medium"
            >
              {keyword}
            </span>
          ))}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors"
            disabled={disabled}
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-red-950/50 text-muted-foreground hover:text-red-400 transition-colors"
            disabled={disabled}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-neutral-800/50 border border-neutral-700 focus-within:border-primary/50 transition-colors">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-700 text-xs font-medium"
          >
            {keyword}
            <button
              onClick={() => removeKeyword(keyword)}
              className="hover:text-red-400 transition-colors"
              type="button"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={keywords.length === 0 ? "Type keyword and press Enter..." : "Add more..."}
          className="flex-1 min-w-[120px] bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          disabled={disabled}
          autoFocus={autoFocus}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={disabled || keywords.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={12} />
          Save
        </button>
        <button
          onClick={handleCancel}
          disabled={disabled}
          className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
