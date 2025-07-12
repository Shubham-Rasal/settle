import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Blockchain, blockchainNames, blockchainLogos, type WalletSet } from "@/lib/types"
import Image from "next/image"

const walletTypes = [
  { id: "user", name: "User-Controlled" },
  { id: "developer", name: "Developer-Controlled" },
]

const walletTypeInfo = {
  title: "Wallet Control Types",
  description: `User-Controlled: Private keys held by end-user (via MPC/passkeys). User must authenticate/sign transactions.
Developer-Controlled: Private keys held by developer (via MPC, with entity secret). App signs on user's behalf.`
}

interface CreateWalletDialogProps {
  onWalletCreated?: () => void;
}

export function CreateWalletDialog({ onWalletCreated }: CreateWalletDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [chain, setChain] = useState<Blockchain | "">("")
  const [controlType, setControlType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [walletSets, setWalletSets] = useState<WalletSet[]>([])
  const [selectedSetOption, setSelectedSetOption] = useState<"existing" | "new">("new")
  const [selectedSetId, setSelectedSetId] = useState("")
  const [walletSetName, setWalletSetName] = useState("")
  const [isLoadingSets, setIsLoadingSets] = useState(false)

  useEffect(() => {
    const fetchWalletSets = async () => {
      setIsLoadingSets(true)
      try {
        const response = await fetch("/api/wallets/sets")
        if (!response.ok) {
          throw new Error("Failed to fetch wallet sets")
        }
        const data = await response.json()
        setWalletSets(data)
        // If there are existing sets, default to using them
        if (data.length > 0) {
          setSelectedSetOption("existing")
          setSelectedSetId(data[0].id)
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch wallet sets")
      } finally {
        setIsLoadingSets(false)
      }
    }

    if (open) {
      fetchWalletSets()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !chain || !controlType) {
      toast.error("Please fill in all fields")
      return
    }

    if (controlType !== "developer") {
      toast.error("Only developer-controlled wallets are supported at this time")
      return
    }

    if (selectedSetOption === "new" && !walletSetName) {
      toast.error("Please enter a wallet set name")
      return
    }

    setIsLoading(true)
    try {
      let walletSetId = selectedSetId

      if (selectedSetOption === "new") {
        // Create new wallet set
        const walletSetResponse = await fetch("/api/wallets/create-set", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: walletSetName,
          }),
        })

        if (!walletSetResponse.ok) {
          const error = await walletSetResponse.json()
          throw new Error(error.error || "Failed to create wallet set")
        }

        const {walletSet} = await walletSetResponse.json()
        console.log(walletSet)
        walletSetId = walletSet.id

        toast.success(`Wallet set ${walletSetId} created successfully!`)
      }

      // Create the wallet in the selected/new set
      const walletResponse = await fetch("/api/wallets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          walletSetId,
          blockchains: [chain],
        }),
      })

      if (!walletResponse.ok) {
        const error = await walletResponse.json()
        throw new Error(error.error || "Failed to create wallet")
      }

      toast.success(`Wallet ${name} created successfully!`)
      console.log(walletResponse.json())
      setOpen(false)
      resetForm()
      onWalletCreated?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to create wallet")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setChain("")
    setControlType("")
    setSelectedSetOption("new")
    setSelectedSetId("")
    setWalletSetName("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Wallet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="controlType">Control Type</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] whitespace-pre-line">
                    <p className="font-semibold">{walletTypeInfo.title}</p>
                    <p>{walletTypeInfo.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={controlType} onValueChange={setControlType}>
              <SelectTrigger>
                <SelectValue placeholder="Select wallet control type" />
              </SelectTrigger>
              <SelectContent>
                {walletTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Wallet Set</Label>
            <div className="space-y-2">
              {walletSets.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="existing"
                    name="setOption"
                    value="existing"
                    checked={selectedSetOption === "existing"}
                    onChange={(e) => setSelectedSetOption(e.target.value as "existing" | "new")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="existing">Use Existing Set</Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new"
                  name="setOption"
                  value="new"
                  checked={selectedSetOption === "new"}
                  onChange={(e) => setSelectedSetOption(e.target.value as "existing" | "new")}
                  className="h-4 w-4"
                />
                <Label htmlFor="new">Create New Set</Label>
              </div>
            </div>

            {selectedSetOption === "existing" && walletSets.length > 0 && (
              <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet set" />
                </SelectTrigger>
                <SelectContent>
                  {walletSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedSetOption === "new" && (
              <div className="space-y-2">
                <Label htmlFor="walletSetName">Set Name</Label>
                <Input
                  id="walletSetName"
                  placeholder="Enter wallet set name"
                  value={walletSetName}
                  onChange={(e) => setWalletSetName(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chain">Chain</Label>
            <Select value={chain} onValueChange={(value) => setChain(value as Blockchain)}>
              <SelectTrigger>
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Blockchain).map((blockchain) => (
                  <SelectItem key={blockchain} value={blockchain} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={blockchainLogos[blockchain]}
                        alt={blockchainNames[blockchain]}
                        width={20}
                        height={20}
                      />
                      {blockchainNames[blockchain]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Wallet Name</Label>
            <Input
              id="name"
              placeholder="Enter wallet name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isLoadingSets}>
            {isLoading ? "Creating..." : "Create Wallet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 