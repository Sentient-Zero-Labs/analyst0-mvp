"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import {
  CharterMetricExample,
  CharterMetricExampleCreate,
  CharterMetricExampleCreateSchema,
  CharterMetricExampleUpdate,
  CharterMetricExampleUpdateSchema,
} from "@/services/charterMetricExample/charterMetricExample.schema";
import {
  useCreateCharterMetricExampleMutation,
  useExplainCharterMetricExampleMutation,
  useUpdateCharterMetricExampleMutation,
} from "@/services/charterMetricExample/charterMetricExample.service";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { VscRobot } from "react-icons/vsc";

interface MetricFormProps {
  charterMetricExample?: CharterMetricExample;
  charterMetricId: number;
  charterId: number;
  organisationPublicId: string;
}

export function CharterMetricExampleForm({
  charterMetricExample,
  charterId,
  charterMetricId,
  organisationPublicId,
}: MetricFormProps) {
  const queryClient = useQueryClient();

  const router = useRouter();
  const isCreateMode = !charterMetricExample;

  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  const form = useForm<CharterMetricExampleCreate | CharterMetricExampleUpdate>({
    resolver: zodResolver(isCreateMode ? CharterMetricExampleCreateSchema : CharterMetricExampleUpdateSchema),
    defaultValues: charterMetricExample || {
      query: "",
      explanation: "",
    },
  });

  useEffect(() => {
    form.reset(charterMetricExample);
  }, [charterMetricExample, form]);

  const { mutateAsync: explainCharterMetricExampleMutation } = useExplainCharterMetricExampleMutation({
    charterMetricId,
    charterId,
    organisationPublicId,
  });

  const createCharterMetricExampleMutation = useCreateCharterMetricExampleMutation({
    charterMetricId,
    charterId,
    organisationPublicId,
  });
  const updateCharterMetricExampleMutation = useUpdateCharterMetricExampleMutation({
    charterMetricId,
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
      const explanation = await explainCharterMetricExampleMutation({ query });
      form.setValue("explanation", explanation.explanation, { shouldDirty: true });
    } catch (error) {
      console.error("Error generating explanation:", error);
      toast.error("Error generating explanation, please check your query and try again.");
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const onSubmit = (data: CharterMetricExampleCreate | CharterMetricExampleUpdate) => {
    if (isCreateMode) {
      createCharterMetricExampleMutation.mutate(data, {
        onSuccess: () => {
          form.reset(data);
          toast.success("Data Agent Metric example created successfully");
          router.refresh();
          setTimeout(() => {
            router.push(
              `/organisation/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples`
            );
          }, 500);
        },
        onError: (error) => {
          console.error("Error creating data agent metric example:", error);
          toast.error("Error creating data agent metric example");
        },
      });
    } else {
      updateCharterMetricExampleMutation.mutate(
        {
          charterMetricExampleId: charterMetricExample?.id,
          charterMetricExample: data,
        },
        {
          onSuccess: () => {
            form.reset(data);
            router.refresh();
            toast.success("Data Agent Metric Example updated successfully");

            queryClient.setQueryData(["charterMetricExample", charterMetricExample?.id], data);

            setTimeout(() => {
              router.push(
                `/organisation/${organisationPublicId}/charters/${charterId}/metrics/${charterMetricId}/examples`
              );
            }, 500);
          },
          onError: (error) => {
            console.error("Error updating data agent metric example:", error);
            toast.error("Error updating data agent metric example");
          },
        }
      );
    }
  };

  const isPending = isCreateMode
    ? createCharterMetricExampleMutation.isPending
    : updateCharterMetricExampleMutation.isPending;

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
                <Textarea className="min-h-48" {...field} placeholder="Query where the metric is calculated" />
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
