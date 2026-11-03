CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products (id),
    created_by UUID REFERENCES users (id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('restock', 'sale', 'adjustment', 'return')),
    quantity_change INTEGER NOT NULL CHECK (quantity_change <> 0),
    reference_type TEXT,
    reference_id UUID,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX inventory_movements_product_id_created_at_idx
    ON inventory_movements (product_id, created_at DESC);
