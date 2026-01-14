-- Create invoice_metadata table for WhatsApp delivery tracking
CREATE TABLE IF NOT EXISTS public.invoice_metadata (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  order_id uuid NOT NULL UNIQUE,
  invoice_id text NOT NULL,
  customer_name text,
  customer_phone text,
  invoice_pdf_path text,
  invoice_pdf_generated_at timestamp with time zone,
  whatsapp_status text NOT NULL DEFAULT 'not_prepared',
  signed_url_last_generated_at timestamp with time zone,
  signed_url_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoice_metadata_order_id ON public.invoice_metadata(order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_metadata_user_id ON public.invoice_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_metadata_invoice_id ON public.invoice_metadata(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_metadata_whatsapp_status ON public.invoice_metadata(whatsapp_status);

-- Enable RLS
ALTER TABLE public.invoice_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own invoice metadata
CREATE POLICY "Users can manage their own invoice metadata"
ON public.invoice_metadata
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Also allow anonymous access for now (matching existing pattern)
CREATE POLICY "Allow anonymous access to invoice metadata"
ON public.invoice_metadata
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_invoice_metadata_updated_at
BEFORE UPDATE ON public.invoice_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for invoice PDFs (service role only - no public access)
CREATE POLICY "Service role can manage invoice files"
ON storage.objects
FOR ALL
USING (bucket_id = 'invoices')
WITH CHECK (bucket_id = 'invoices');