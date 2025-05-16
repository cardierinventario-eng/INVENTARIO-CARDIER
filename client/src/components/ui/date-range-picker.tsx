import * as React from "react";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({ className, date, onDateChange }: DatePickerWithRangeProps) {
  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal w-full">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "P", { locale: ptBR })} -{" "}
                  {format(date.to, "P", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "P", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={ptBR}
          />
          <div className="p-3 border-t flex justify-between gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDateChange({ 
                from: new Date(), 
                to: addDays(new Date(), 7) 
              })}
            >
              Últimos 7 dias
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDateChange({ 
                from: addDays(new Date(), -30), 
                to: new Date() 
              })}
            >
              Últimos 30 dias
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}