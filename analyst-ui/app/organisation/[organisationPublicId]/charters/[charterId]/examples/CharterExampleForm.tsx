"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { VscRobot } from "react-icons/vsc";
import {
  CharterExample,
  CharterExampleCreate,
  CharterExampleCreateSchema,
  CharterExampleUpdate,
  CharterExampleUpdateSchema,
} from "@/services/charterExample/charterExample.schema";
import {
  useCreateCharterExampleMutation,
  useExplainCharterExampleMutation,
  useUpdateCharterExampleMutation,
} from "@/services/charterExample/charterExample.service";

interface CharterExampleFormProps {
  charterExample?: CharterExample;
  charterId: number;
  organisationPublicId: string;
}

export function CharterExampleForm({ charterExample, charterId, organisationPublicId }: CharterExampleFormProps) {
  const queryClient = useQueryClient();

  const router = useRouter();
  const isCreateMode = !charterExample;

  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  const form = useForm<CharterExampleCreate | CharterExampleUpdate>({
    resolver: zodResolver(isCreateMode ? CharterExampleCreateSchema : CharterExampleUpdateSchema),
    defaultValues: charterExample || {
      query: "",
      explanation: "",
    },
  });

  useEffect(() => {
    form.reset(charterExample);
  }, [charterExample, form]);

  const { mutateAsync: explainCharterExampleMutation } = useExplainCharterExampleMutation({
    charterId,
    organisationPublicId,
  });

  const createCharterExampleMutation = useCreateCharterExampleMutation({
    charterId,
    organisationPublicId,
  });

  const updateCharterExampleMutation = useUpdateCharterExampleMutation({
    charterId,
    organisationPublicId,
  });

  const onClickGenerateExplanation = async () => {
    const query = form.getValues().query;

    if (!query) {
      toast.error("Query is required");
      return;
    }

    try {
      setIsGeneratingExplanation(true);
      const explanation = await explainCharterExampleMutation({ query });
      form.setValue("explanation", explanation.explanation, { shouldDirty: true });
    } catch (error) {
      console.error("Error generating explanation:", error);
      toast.error("Error generating explanation, please check your query and try again.");
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const onSubmit = (data: CharterExampleCreate | CharterExampleUpdate) => {
    if (isCreateMode) {
      createCharterExampleMutation.mutate(data, {
        onSuccess: () => {
          form.reset(data);
          toast.success("Charter Example created successfully");
          router.refresh();
          setTimeout(() => {
            router.push(`/organisation/${organisationPublicId}/charters/${charterId}/examples`);
          }, 500);
        },
        onError: (error) => {
          console.error("Error creating charter example:", error);
          toast.error("Error creating charter example");
        },
      });
    } else {
      updateCharterExampleMutation.mutate(
        {
          charterExampleId: charterExample?.id,
          charterExample: data,
        },
        {
          onSuccess: () => {
            form.reset(data);
            router.refresh();
            toast.success("Charter Example updated successfully");

            queryClient.setQueryData(["charterExample", charterExample?.id], data);

            setTimeout(() => {
              router.push(`/organisation/${organisationPublicId}/charters/${charterId}/examples`);
            }, 500);
          },
          onError: (error) => {
            console.error("Error updating charter example:", error);
            toast.error("Error updating charter example");
          },
        }
      );
    }
  };

  const isPending = isCreateMode ? createCharterExampleMutation.isPending : updateCharterExampleMutation.isPending;

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Query</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-48"
                  {...field}
                  placeholder="Query where the tables of the data agent are used"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel>Explanation</FormLabel>
              <FormDescription className="text-xs italic">
                Explain what is calculated by the query and how it is calculated. Include any assumptions or
                considerations. Which data entities are used and how they are used.
              </FormDescription>
              <div className="pt-1">
                <FormControl>
                  <Textarea className="min-h-48" {...field} placeholder="Describe Example" />
                </FormControl>
              </div>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  type="button"
                  className="flex gap-1 text-xs items-center h-6 font-semibold"
                  onClick={onClickGenerateExplanation}
                  disabled={isGeneratingExplanation}
                >
                  <span>{isGeneratingExplanation ? "Generating..." : "Generate AI Explanation"}</span>
                  <VscRobot className="size-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending ? "Saving..." : isCreateMode ? "Create Example" : "Update Example"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
