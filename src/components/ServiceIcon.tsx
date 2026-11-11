import {
  Building2,
  Calculator,
  FileCheck2,
  Globe,
  Landmark,
  Users,
} from "lucide-react";
import type { ServiceDefinition } from "@/types/cms";

export function ServiceIcon({
  name,
  className = "h-5 w-5",
}: {
  name: ServiceDefinition["iconName"];
  className?: string;
}) {
  switch (name) {
    case "Building2":
      return <Building2 className={className} />;
    case "FileCheck2":
      return <FileCheck2 className={className} />;
    case "Calculator":
      return <Calculator className={className} />;
    case "Landmark":
      return <Landmark className={className} />;
    case "Users":
      return <Users className={className} />;
    case "Globe":
      return <Globe className={className} />;
  }
}
